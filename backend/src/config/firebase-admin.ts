import admin from 'firebase-admin';

const serviceAccount = {
  type: 'service_account',
  project_id: 'hafsa-77',
  private_key_id: 'cda706cf1a50ae77f2e1dfea6f04dcf73b8f20c5',
  private_key: (process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCe7FSFVIQXpObP\ni2w0yzTQcuN6ULxmsU1zVTwQfXQXVYQRtsOCBI44tlh7ndIFxVRStCZjoIXALlrf\nc5EmuK4ngPff2fOeZWFCnRusf9M1IRWFiR49k26CDlOd/CBtZhARN2zWX/BHhAOC\nKVwxVNt8rqyqBibIgXuVdhdTEpYx2GkUbbJzSB1FYSL1zB5qzbX1yNj2jHuTeOmA\nI56zfhH4fuTA4JJKlrapxMO7TMqdaF1A+4CaUY6v2fSnT1I3mCAq0A5M6wqCVcCA\nws57VWH7Sg/yFeZNOVsDcjxwtsz3170KrNrtw9v9kMv2G5tyP/evnrZD9PMkM1Ur\n7NMeJ+GzAgMBAAECggEAEo1PHpNrqiDvasoBUzZnj2/h+zziiXBoNK7+CITEoRa0\nCKdXsl1axucOdDvLsS3EdrUeCCJMis8+f3hLuQP1HJpzFTgpttNp469YdC4l1z1p\n+EE1/QUxcNBAVaCBnpO8C253b50afRa9nBu87etUhf0UHfMC4wQui5eSCHoSe3Xz\nURwZfGQQbZHD3gBepfKoe175FwGgN0jLT9XAFEyvJuGup6O2asz03GmXCuNwM/xA\nhq9j48hWtHxbsbpoN3VYSL3B7gvFnYhIzjXJ0bH00m00cUjaO2lEXD4QOoLgLgIm\n5DhjYJmwBLg9gdlcGtVg2QeCedcl6w6BbLa2P3QA7QKBgQDM6FDCelfY53T5GOqt\nApCFZPxHXtkdRGa7xiMguRN3gvXwtp8IIRyi11eqseYrnlkkbGPmqM8n1Zksjn8W\n0R+Tza8o7MXhGBtK/WNK7j7VzZNEYspJsvBuoxIhtL8I8wwA6h702Y6wStFYzCN5\njNVpVpPbfpUIjL/Ye4tAd+v+JwKBgQDGjLyqFm75+ghKVCF751EipP6t3lkhi42Q\n5zk6xLOI/WVMZu7eyWDs6QO6VyInsMstScdIMLYROsFE6CPFfDPK84nGyAEIx4pF\nYOMzunhKAvt64i/wLnzMAHWjW0a6tBdph+RT1ZCeNTT+aZn45h6Xb5EnUe1VlD3I\nCatoYamDlQKBgAJ3hYlh2a7l0nWxRBoDHuRMO/FMBgchLK90CjY5pC9bJ0TXngCG\nDYc0WnzWmXPK+z3CBE3hmGTdYHO133fR2rR31HUErLkyBhoYBNsBFUaTrAM1wUOz\n4MskMXKwb2BXNLzKFMdT2zDqJa0RABhVhrg2757D3l10/FZJ3npPN0sfAoGAd+Ft\n4HyfEQvoiYh2lys5j+NzamOACYMLPNx/b35osGPfD9xuidGpViHzAEWv96sFYhjT\n3ECdDZYeL47CWnD9jKKzI3SLO1PPpsgzJn6GNpnKYY3ESA6phzsXzERGVmB6aluE\nfyHJqdySXLJCJ0g6XFEeoVEULcHN88Py3JlrEmkCgYBIdUBv0zKKjjAnLRgq/Doj\nna91cwowxH4WTYKxYDxWLiMwFVnzacrl0eePjRJMXCGRvkARTeNlh96U8UBMDjlh\ni1rH95HB+sPR8eC74mHKRikFfGc6lCiK2bfbXPYFvwkIJrvoFxG6WvxCXGSbrrde\nlSZas1m762q0PclEyXG33g==\n-----END PRIVATE KEY-----\n').replace(/\\n/g, '\n'),
  client_email: 'firebase-adminsdk-fbsvc@hafsa-77.iam.gserviceaccount.com',
  client_id: '116227766269681231815',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40hafsa-77.iam.gserviceaccount.com',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'hafsa-77',
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminMessaging = admin.messaging();

export default admin;
