import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ddb = new DynamoDBClient({});
const ses = new SESv2Client({});

const {
    TABLE_NAME,
    WEBINAR_ID,
    WEBINAR_TITLE,
    WEBINAR_DATE = '',
    WEBINAR_TIME = '',
    WEBINAR_TIMEZONE = '',
    WEBINAR_JOIN_URL = '',
    SENDER_EMAIL,
    SENDER_NAME = 'MastersAWS',
    NOTIFY_EMAIL = '',
    SITE_URL = 'https://www.mastersaws.com/webinar-automatizacion-ia/',
} = process.env;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

const json = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

const clean = (v, max) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '');

const escapeHtml = (s) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function scheduleText() {
    if (WEBINAR_DATE && WEBINAR_TIME) {
        return `${WEBINAR_DATE} a las ${WEBINAR_TIME}${WEBINAR_TIMEZONE ? ` (${WEBINAR_TIMEZONE})` : ''}`;
    }
    if (WEBINAR_DATE) return WEBINAR_DATE;
    return '';
}

function confirmationEmail(name) {
    const when = scheduleText();
    const safeName = escapeHtml(name);
    const whenLine = when
        ? `Te esperamos el <strong>${escapeHtml(when)}</strong>.`
        : 'Te enviaremos la fecha, la hora y el enlace de acceso antes del evento.';
    const joinLine = WEBINAR_JOIN_URL
        ? `<p style="margin:24px 0"><a href="${escapeHtml(WEBINAR_JOIN_URL)}" style="background:#1463ff;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;display:inline-block">Unirme al webinar</a></p>`
        : '';

    const html = `<!DOCTYPE html><html lang="es"><body style="margin:0;background:#040a17;font-family:Arial,Helvetica,sans-serif;color:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#040a17;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#091226;border:1px solid #1d3566;border-radius:12px;padding:32px">
<tr><td>
<p style="margin:0 0 8px;color:#3aa8ff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Webinar gratuito · Automatización e IA</p>
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#ffffff">¡Tu lugar está reservado, ${safeName}!</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#d6def0">Gracias por registrarte en <strong>${escapeHtml(WEBINAR_TITLE)}</strong>.</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#d6def0">${whenLine}</p>
${joinLine}
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#9fb3d9">Si tienes preguntas, responde a este correo o escríbenos por WhatsApp al +58 412 9837999.</p>
<p style="margin:24px 0 0;font-size:13px;color:#6f84ad">MastersAWS · <a href="${escapeHtml(SITE_URL)}" style="color:#3aa8ff">${escapeHtml(SITE_URL)}</a></p>
</td></tr></table></td></tr></table></body></html>`;

    const text = [
        `¡Tu lugar está reservado, ${name}!`,
        '',
        `Gracias por registrarte en ${WEBINAR_TITLE}.`,
        when ? `Te esperamos el ${when}.` : 'Te enviaremos la fecha, la hora y el enlace de acceso antes del evento.',
        WEBINAR_JOIN_URL ? `Enlace de acceso: ${WEBINAR_JOIN_URL}` : '',
        '',
        'Si tienes preguntas, responde a este correo o escríbenos por WhatsApp al +58 412 9837999.',
        `MastersAWS · ${SITE_URL}`,
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');

    return {
        subject: when ? `Confirmado: ${WEBINAR_TITLE} · ${when}` : `Confirmado: ${WEBINAR_TITLE}`,
        html,
        text,
    };
}

async function sendEmail({ to, subject, html, text, replyTo }) {
    await ses.send(new SendEmailCommand({
        FromEmailAddress: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        Destination: { ToAddresses: [to] },
        ReplyToAddresses: replyTo ? [replyTo] : [SENDER_EMAIL],
        Content: {
            Simple: {
                Subject: { Data: subject, Charset: 'UTF-8' },
                Body: {
                    Html: html ? { Data: html, Charset: 'UTF-8' } : undefined,
                    Text: { Data: text, Charset: 'UTF-8' },
                },
            },
        },
    }));
}

async function setEmailStatus(email, status) {
    await ddb.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { webinarId: { S: WEBINAR_ID }, email: { S: email } },
        UpdateExpression: 'SET confirmationStatus = :s, confirmationUpdatedAt = :t',
        ExpressionAttributeValues: { ':s': { S: status.slice(0, 500) }, ':t': { S: new Date().toISOString() } },
    }));
}

export const handler = async (event) => {
    let body;
    try {
        const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
        if (raw.length > 4000) return json(413, { ok: false, error: 'payload_too_large' });
        body = JSON.parse(raw);
    } catch {
        return json(400, { ok: false, error: 'invalid_json' });
    }

    // Honeypot: bots fill hidden fields; answer as success without storing anything.
    if (clean(body.website, 200)) return json(201, { ok: true });

    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const phone = clean(body.phone, 30);
    const company = clean(body.company, 160);
    const role = clean(body.role, 120);

    const errors = [];
    if (name.length < 2) errors.push('name');
    if (!EMAIL_RE.test(email)) errors.push('email');
    if (!PHONE_RE.test(phone) || phone.replace(/\D/g, '').length < 7) errors.push('phone');
    if (company.length < 2) errors.push('company');
    if (role.length < 2) errors.push('role');
    if (errors.length) return json(422, { ok: false, error: 'validation', fields: errors });

    const now = new Date().toISOString();
    const http = event.requestContext?.http || {};

    try {
        await ddb.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                webinarId: { S: WEBINAR_ID },
                email: { S: email },
                name: { S: name },
                phone: { S: phone },
                company: { S: company },
                role: { S: role },
                createdAt: { S: now },
                sourceIp: { S: http.sourceIp || '' },
                userAgent: { S: (http.userAgent || '').slice(0, 300) },
                confirmationStatus: { S: 'pending' },
            },
            ConditionExpression: 'attribute_not_exists(email)',
        }));
    } catch (err) {
        if (err.name === 'ConditionalCheckFailedException') {
            return json(200, { ok: true, alreadyRegistered: true });
        }
        console.error('dynamodb_put_failed', err);
        return json(500, { ok: false, error: 'storage_failed' });
    }

    const mail = confirmationEmail(name);
    try {
        await sendEmail({ to: email, ...mail });
        await setEmailStatus(email, 'sent');
    } catch (err) {
        console.error('confirmation_email_failed', { email, name: err.name, message: err.message });
        await setEmailStatus(email, `failed: ${err.name}: ${err.message}`).catch(() => {});
    }

    if (NOTIFY_EMAIL) {
        const text = [
            `Nuevo registro al webinar ${WEBINAR_TITLE}`,
            '',
            `Nombre: ${name}`,
            `Correo: ${email}`,
            `Teléfono: ${phone}`,
            `Empresa: ${company}`,
            `Cargo o área: ${role}`,
            `Fecha de registro: ${now}`,
        ].join('\n');
        await sendEmail({ to: NOTIFY_EMAIL, subject: `Nuevo registro webinar: ${name} (${company})`, text, replyTo: email })
            .catch((err) => console.error('notify_email_failed', { name: err.name, message: err.message }));
    }

    return json(201, { ok: true });
};
