import sgMail from '@sendgrid/mail';

export class EmailService {
  static initialize(): void {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('Warning: SendGrid API key not configured');
      return;
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  static async sendPriceChangeAlert(
    productTitle: string,
    variantTitle: string,
    sku: string,
    oldPrice: number,
    newPrice: number
  ): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('Warning: SendGrid API key not configured, skipping email notification');
      return;
    }

    if (!process.env.NOTIFICATION_EMAIL || !process.env.NOTIFICATION_EMAIL_FROM) {
      console.warn('Warning: Notification email addresses not configured');
      return;
    }

    const priceDecrease = ((oldPrice - newPrice) / oldPrice) * 100;
    const msg = {
      to: process.env.NOTIFICATION_EMAIL,
      from: process.env.NOTIFICATION_EMAIL_FROM,
      subject: `Price Alert: ${productTitle} - ${priceDecrease.toFixed(1)}% decrease`,
      html: `
        <h2>Price Change Alert</h2>
        <p><strong>Product:</strong> ${productTitle}</p>
        <p><strong>Variant:</strong> ${variantTitle}</p>
        ${sku ? `<p><strong>SKU:</strong> ${sku}</p>` : ''}
        <p><strong>Old Price:</strong> $${oldPrice.toFixed(2)}</p>
        <p><strong>New Price:</strong> $${newPrice.toFixed(2)}</p>
        <p><strong>Price Decrease:</strong> ${priceDecrease.toFixed(1)}%</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Price change notification email sent successfully');
    } catch (error) {
      console.error('Error sending price change notification:', error);
      throw error;
    }
  }
}
