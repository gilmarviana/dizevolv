const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailRecipient {
    email: string;
    name?: string;
}

interface SendEmailOptions {
    to: EmailRecipient[];
    subject: string;
    htmlContent: string;
    sender?: EmailRecipient;
}

export const emailService = {
    /**
     * Sends a transactional email via Brevo
     */
    async sendEmail({ to, subject, htmlContent, sender }: SendEmailOptions) {
        if (!BREVO_API_KEY) {
            console.error('Brevo API key not found. Email not sent.');
            return { success: false, error: 'API key missing' };
        }

        try {
            const response = await fetch(BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': BREVO_API_KEY,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    sender: sender || { name: 'ClinicOps', email: 'contato@clinicops.com' },
                    to,
                    subject,
                    htmlContent,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Brevo API error:', errorData);
                throw new Error(errorData.message || 'Failed to send email');
            }

            const data = await response.json();
            return { success: true, messageId: data.messageId };
        } catch (error: any) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Send an invite email to a new team member
     */
    async sendInviteEmail(email: string, nome: string, clinicName: string) {
        const subject = `Convite: Junte-se à equipe da ${clinicName} no ClinicOps`;
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h1 style="color: #0ea5e9; font-size: 24px; font-weight: 800; margin-bottom: 20px;">ClinicOps</h1>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">Olá, <strong>${nome}</strong>!</p>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">
                    Você foi convidado para fazer parte da equipe da clínica <strong>${clinicName}</strong> no ClinicOps.
                </p>
                <div style="margin: 30px 0;">
                    <a href="${window.location.origin}/auth/login" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                        Aceitar Convite e Acessar
                    </a>
                </div>
                <p style="font-size: 14px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #f1f5f9; pt: 20px;">
                    Se você não esperava por este convite, pode ignorar este email.
                </p>
            </div>
        `;

        return this.sendEmail({
            to: [{ email, name: nome }],
            subject,
            htmlContent,
        });
    },

    /**
     * Send a welcome email to a new clinic
     */
    async sendWelcomeEmail(email: string, nome: string) {
        const subject = `Bem-vindo ao ClinicOps, ${nome}!`;
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #0ea5e9;">Bem-vindo ao ClinicOps!</h1>
                <p>Estamos muito felizes em ter você conosco.</p>
                <p>Sua plataforma de gestão clínica inteligente já está pronta para uso.</p>
                <p>Comece cadastrando seu primeiro paciente ou configurando sua equipe.</p>
                <div style="margin-top: 30px;">
                    <a href="${window.location.origin}/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Ir para o Dashboard
                    </a>
                </div>
            </div>
        `;

        return this.sendEmail({
            to: [{ email, name: nome }],
            subject,
            htmlContent,
        });
    },

    /**
     * Send an appointment confirmation email to a patient
     */
    async sendAppointmentConfirmation(email: string, nome: string, date: string, type: string, clinicName: string) {
        const formattedDate = new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const subject = `Confirmação de Agendamento - ${clinicName}`;
        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h1 style="color: #0ea5e9; font-size: 24px; font-weight: 800; margin-bottom: 20px;">ClinicOps</h1>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;">Olá, <strong>${nome}</strong>!</p>
                <p style="font-size: 16px; color: #475569; line-height: 1.6;"> Seu agendamento foi realizado com sucesso.</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>📋 Tipo:</strong> ${type}</p>
                    <p style="margin: 0 0 10px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
                    <p style="margin: 0;"><strong>🏥 Local:</strong> ${clinicName}</p>
                </div>

                <p style="font-size: 14px; color: #64748b;">
                    Se precisar desmarcar ou reagendar, entre em contato conosco o quanto antes.
                </p>
                
                <p style="font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                    Enviado via ClinicOps - Gestão Clínica Inteligente
                </p>
            </div>
        `;

        return this.sendEmail({
            to: [{ email, name: nome }],
            subject,
            htmlContent,
        });
    }
};
