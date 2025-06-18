import { getAuth } from 'firebase-admin/auth'
import { onRequest } from 'firebase-functions/v2/https'
import { cert, initializeApp } from 'firebase-admin/app'

const serviceAccount = {
    type: 'service_account',
    project_id: 'iqol-crm',
    private_key_id: 'b44356564c9719314e6cc2a5cb798467a0e2399f',
    private_key:
        '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSfbUCgN/y+rEd\nisjuhh7j0pM2UKoLWPOEhqrfUe/4Z9a+ZV3a67b+muYqmEfzRWCfvkYyMEoUw4s3\ndqJrnDBos6KczAiuRG8j/Jov648F8L9SHfSPEGZgi3e5x0Wr0np38NQaNN6d56j2\nsJsPirTwGM2MOvuortqHX1tq3VjDQcBGVnbL1h4kEeGx9yWIp+1yeC3WCWI5qyg6\n1VNRyA2pg+Zeut+MkYNa1LccC94vdUxICIusVTwVjzHrLZ6Z57u33e9YgTRQCa7G\nDE73zasgoSuum6+XhlnAxtQXlIiMezpXr2xQ8FJhWrNQs2UG40ionoAv7q98ijXO\n01BXnidXAgMBAAECggEACWLur/pkQjcYr9sRA8X6Wal5xBnLw27HiTjiJMxIGbkz\ns9DcYxdQ1UC+E9cvmjMVUHpRMgrCOvPPYP1K1+aiqACet0RH/NFzbVTl4U4tVhP6\nzCQm1DxkfFir0Z6HxlY//NpB8xs5dCww9jNA7uv+DpjkjaTRtR97Aj9n2beeLjLL\nNO3SIzLkTTbk31wWnQj94lI67kTO3F9yjUKGHliOq5Gzdq2vGaN/B+SwUZ0J/uzX\nFQoJM/3WworG88MbKLaHLA+6TU/1W05EjgelR8NihV0S4MglUzZSvXlrAjvBFimf\nlpW2Ciq+7NHGlxxoN3bzkRLOPlb5R3BNNvwJSsSS4QKBgQDuIFbciJElAyHo40vc\n3zyofQv1iwC87sILl8m28GkKsjl9oHztR0WGpNhM+us5oDfJcsJNtv1bKHu2lQBy\nq/ABTBEVmUJ6aGq4RDGBnYf9kXA0k5lMZ+FbAeCDTh4UXJVA3XQEXPBydmRaSJ3B\nv7IdNoVx9TLKv9SlJK9sQV7QIQKBgQDiSlk1LMxlm3emnqt2HQluc67FXe8DLhB+\nM3DtMwRvh8q8Gfxxm3urH+oWn6w3xKUBYF3qY5+N2foUUexFCq7QfM15yCgy+8HW\no9MRB1kOPmtTtRbJut2hV5DpJbjpT4CPVh2+a9mWSZeqBjORKCsUOwLSed8vM50z\nLKL4CD5odwKBgHxva9SsjOSBgYvYk0ElauZFCiXS8JzKS56RQDiX4txTDBXo8r9v\nuhZFOD7p9FfVsLFVhdHkqPqk6hkcPfKuhKm43UijIQkkXXhTMmegMXtBMBhZdQdn\nVW0gSvlyredIBjqyPrk08/Vshr5jKgUgLmxznEJTtqoamn198Smp82jhAoGBAKGe\nRj5zQ3yiX/+RvZY7QNwxJTbzUtyrjr4D0XioAlgB3SshSCp/yQC8Z31HB0JBYTQt\ndoYMJw2yDCltJVleOuLO8BY1fXiEVLoPAZVc8R76N79uS9tCaj5sgyPxfDKuRHyb\nHd09vAbZgse9bCEVVkc5qldXEa7tpy3AiJirkp8bAoGAPQWGOg0JUIgqtA39IEX2\nfK+6APe8Hi5KQOz2vbTwtytJnIPmSHj0y1492jfjw6hGrPyL4Eu7tRSFh+EM3wWM\nqO/TxjAgja+DzH/8MgwcI4oXMq1KoKEMYAXoAyfdKbdmS0K2MN+BVla2PS48qF9/\nMnkFOt4iEoWWVmBDjb6j7Zo=\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-fbsvc@iqol-crm.iam.gserviceaccount.com',
    client_id: '105834381785699477522',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
        'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40iqol-crm.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
}

initializeApp({
    credential: cert(serviceAccount),
})

export const setCustomClaims = onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed')
        return
    }

    const { uid, role } = req.body

    if (!uid || !role) {
        res.status(400).send('Missing UID or role')
        return
    }

    try {
        await getAuth().setCustomUserClaims(uid, { role })
        res.json({ message: `Success! User ${uid} has been assigned role ${role}` })
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error')
    }
})
