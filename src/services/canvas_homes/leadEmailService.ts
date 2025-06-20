import emailjs from 'emailjs-com'

export const sendLeadEmail = (customerEmail: string, content: string, subject: string) => {
    const serviceID = 'service_x9r5ccr'
    const templateID = 'template_l8odwgj'
    const userID = 'Fx8fCa1UIOsdjb-SV'

    const templateParams = {
        customer_email: 'mail.rajanydv@gmail.com',
        subject: subject,
        content: content,
    }

    emailjs
        .send(serviceID, templateID, templateParams, userID)
        .then((response: any) => {
            console.log('Email sent successfully!', response.status, response.text)
        })
        .catch((error: any) => {
            console.error('Failed to send email:', error)
        })
}
