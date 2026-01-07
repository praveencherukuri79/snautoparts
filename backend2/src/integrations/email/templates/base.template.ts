/**
 * Base Email Template
 * 
 * Provides consistent wrapper and styling for all email templates.
 */

export interface BaseTemplateOptions {
  title: string;
  preheader?: string;
  content: string;
  showFooter?: boolean;
}

const BRAND_COLOR = '#1a1a2e';
const BRAND_NAME = 'SN Auto Parts';
const SUPPORT_EMAIL = 'support@snautoparts.com';
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Wrap content in the base email template
 */
export function wrapInBaseTemplate(options: BaseTemplateOptions): string {
  const { title, preheader = '', content, showFooter = true } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { border: 0; line-height: 100%; }
    a { color: ${BRAND_COLOR}; text-decoration: none; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff !important; border-radius: 6px; font-weight: 600; text-decoration: none; }
    .button:hover { background-color: #2a2a4e; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ''}
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND_COLOR}; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ${BRAND_NAME}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          ${showFooter ? `
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px; line-height: 1.5;">
                Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: ${BRAND_COLOR};">${SUPPORT_EMAIL}</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${CURRENT_YEAR} ${BRAND_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
          ` : ''}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Common styled components for templates
 */
export const components = {
  heading: (text: string) => 
    `<h2 style="color: #111827; margin: 0 0 16px; font-size: 24px; font-weight: 600;">${text}</h2>`,
  
  paragraph: (text: string) => 
    `<p style="color: #4b5563; margin: 0 0 16px; font-size: 16px; line-height: 1.6;">${text}</p>`,
  
  button: (text: string, url: string) => 
    `<a href="${url}" class="button" style="display: inline-block; padding: 14px 28px; background-color: ${BRAND_COLOR}; color: #ffffff; border-radius: 6px; font-weight: 600; text-decoration: none;">${text}</a>`,
  
  infoBox: (content: string) => 
    `<div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">${content}</div>`,
  
  successBox: (content: string) => 
    `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0;">${content}</div>`,
  
  warningBox: (content: string) => 
    `<div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0;">${content}</div>`,
  
  divider: () => 
    `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">`,
};

