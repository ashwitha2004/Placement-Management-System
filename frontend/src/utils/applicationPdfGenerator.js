import html2pdf from 'html2pdf.js';

/**
 * Generate application/resume as PDF
 */
export const generateApplicationPDF = (appData) => {
  const element = document.createElement('div');
  element.style.padding = '20px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';

  const html = `
    <div style="max-width: 800px; margin: 0 auto; font-size: 11px; line-height: 1.6;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
        <h1 style="margin: 0 0 5px 0; font-size: 20px; font-weight: bold;">${appData.fullName || 'Full Name'}</h1>
        <div style="display: flex; gap: 15px; font-size: 10px; color: #555;">
          ${appData.email ? `<span>📧 ${appData.email}</span>` : ''}
          ${appData.phone ? `<span>📱 ${appData.phone}</span>` : ''}
        </div>
        <div style="display: flex; gap: 15px; font-size: 10px; color: #555;">
          ${appData.linkedIn ? `<span>🔗 ${appData.linkedIn}</span>` : ''}
          ${appData.github ? `<span>💻 ${appData.github}</span>` : ''}
          ${appData.website ? `<span>🌐 ${appData.website}</span>` : ''}
        </div>
      </div>

      <!-- Professional Summary -->
      ${appData.summary ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
          <p style="margin: 0; font-size: 10px; line-height: 1.5; text-align: justify;">${appData.summary.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <!-- Work Experience -->
      ${appData.workExperience && appData.workExperience.length > 0 && appData.workExperience.some(exp => exp.position) ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Work Experience</h2>
          ${appData.workExperience.filter(exp => exp.position).map(exp => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-weight: bold; font-size: 11px;">${exp.position}</span>
                <span style="font-size: 10px; color: #666;">${exp.duration || 'N/A'}</span>
              </div>
              <div style="font-size: 10px; color: #666; margin-bottom: 4px;">${exp.company || 'Company'}</div>
              ${exp.details ? `<p style="margin: 0; font-size: 10px; line-height: 1.4;">${exp.details.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${appData.skills && appData.skills.length > 0 && appData.skills.some(s => s.trim()) ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
          <p style="margin: 0; font-size: 10px; line-height: 1.5;">${appData.skills.filter(s => s.trim()).join(' • ')}</p>
        </div>
      ` : ''}

      <!-- Education -->
      ${appData.education && appData.education.length > 0 && appData.education.some(edu => edu.degree) ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
          ${appData.education.filter(edu => edu.degree).map(edu => `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <span style="font-weight: bold; font-size: 11px;">${edu.degree}</span>
                <span style="font-size: 10px; color: #666;">${edu.year || 'N/A'}</span>
              </div>
              <div style="font-size: 10px; color: #666;">${edu.school || 'School'}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Certifications -->
      ${appData.certifications && appData.certifications.length > 0 && appData.certifications.some(cert => cert.name) ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
          ${appData.certifications.filter(cert => cert.name).map(cert => `
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">${cert.name}</span>
              ${cert.issuer ? `<span style="color: #666;"> • ${cert.issuer}</span>` : ''}
              ${cert.year ? `<span style="color: #666;"> • ${cert.year}</span>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Cover Letter -->
      ${appData.coverLetter ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Cover Letter</h2>
          <p style="margin: 0; font-size: 10px; line-height: 1.5; text-align: justify;">${appData.coverLetter.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <!-- Application Info -->
      <div style="border-top: 1px solid #ddd; padding-top: 10px; font-size: 9px; color: #999;">
        <p style="margin: 0;">Applied for: <strong>${appData.appliedPosition || 'Position'}</strong> at <strong>${appData.appliedCompany || 'Company'}</strong></p>
        <p style="margin: 5px 0 0 0;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
  `;

  element.innerHTML = html;

  const opt = {
    margin: 10,
    filename: `${appData.fullName?.replace(/\s+/g, '_') || 'Application'}_${new Date().getTime()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  return html2pdf().set(opt).from(element).save();
};

/**
 * Preview application as HTML
 */
export const previewApplicationHTML = (appData) => {
  const html = `
    <div style="max-width: 900px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; padding: 40px;">
      <!-- Header -->
      <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #1e40af;">${appData.fullName || 'Full Name'}</h1>
        <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: #4b5563;">
          ${appData.email ? `<span>📧 <a href="mailto:${appData.email}" style="color: #2563eb; text-decoration: none;">${appData.email}</a></span>` : ''}
          ${appData.phone ? `<span>📱 ${appData.phone}</span>` : ''}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 13px; color: #4b5563; margin-top: 8px;">
          ${appData.linkedIn ? `<span>🔗 <a href="${appData.linkedIn}" style="color: #2563eb; text-decoration: none;">LinkedIn</a></span>` : ''}
          ${appData.github ? `<span>💻 <a href="${appData.github}" style="color: #2563eb; text-decoration: none;">GitHub</a></span>` : ''}
          ${appData.website ? `<span>🌐 <a href="${appData.website}" style="color: #2563eb; text-decoration: none;">Website</a></span>` : ''}
        </div>
      </div>

      <!-- Professional Summary -->
      ${appData.summary ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Professional Summary</h2>
          <p style="margin: 0; font-size: 13px; line-height: 1.7; text-align: justify; color: #4b5563;">${appData.summary.replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      <!-- Work Experience -->
      ${appData.workExperience && appData.workExperience.length > 0 && appData.workExperience.some(exp => exp.position) ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 15px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Work Experience</h2>
          ${appData.workExperience.filter(exp => exp.position).map(exp => `
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;">${exp.position}</h3>
                <span style="font-size: 12px; color: #6b7280; font-weight: 500;">${exp.duration || 'N/A'}</span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600;">${exp.company || 'Company'}</p>
              ${exp.details ? `<p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">${exp.details.replace(/\n/g, '<br>')}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Skills -->
      ${appData.skills && appData.skills.length > 0 && appData.skills.some(s => s.trim()) ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Skills</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${appData.skills.filter(s => s.trim()).map(skill => `
              <span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${skill.trim()}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education -->
      ${appData.education && appData.education.length > 0 && appData.education.some(edu => edu.degree) ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 15px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Education</h2>
          ${appData.education.filter(edu => edu.degree).map(edu => `
            <div style="margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1f2937;">${edu.degree}</h3>
                <span style="font-size: 12px; color: #6b7280;">${edu.year || 'N/A'}</span>
              </div>
              <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 500;">${edu.school || 'School'}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Certifications -->
      ${appData.certifications && appData.certifications.length > 0 && appData.certifications.some(cert => cert.name) ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Certifications</h2>
          <ul style="margin: 0; padding-left: 20px;">
            ${appData.certifications.filter(cert => cert.name).map(cert => `
              <li style="margin-bottom: 6px; font-size: 13px; color: #4b5563;">
                <strong>${cert.name}</strong>
                ${cert.issuer ? `<span style="color: #6b7280;"> • ${cert.issuer}</span>` : ''}
                ${cert.year ? `<span style="color: #6b7280;"> • ${cert.year}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Cover Letter -->
      ${appData.coverLetter ? `
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">Cover Letter</h2>
          <p style="margin: 0; font-size: 13px; line-height: 1.7; text-align: justify; color: #4b5563; white-space: pre-wrap;">${appData.coverLetter}</p>
        </div>
      ` : ''}

      <!-- Application Info -->
      <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #9ca3af;">
        <p style="margin: 0;">Applied for: <strong style="color: #1f2937;">${appData.appliedPosition || 'Position'}</strong> at <strong style="color: #1f2937;">${appData.appliedCompany || 'Company'}</strong></p>
        <p style="margin: 8px 0 0 0;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  `;

  return html;
};
