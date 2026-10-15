const PAGE_HEIGHT = 297;
const LEFT = 18;
const BOTTOM = PAGE_HEIGHT - 18;

const text = (value) => String(value ?? '').trim();

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
};

export const createResumePdf = async (resumeData) => {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 17;

  const ensureSpace = (height) => {
    if (y + height > BOTTOM) {
      pdf.addPage();
      y = 18;
    }
  };

  const write = (value, options = {}) => {
    const { bold = false, size = 9, indent = 0, gap = 1.2, align = 'left' } = options;
    const valueText = text(value);
    if (!valueText) return;
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(valueText, pageWidth - LEFT * 2 - indent);
    const lineHeight = size * 0.43;
    ensureSpace(lines.length * lineHeight + gap);
    pdf.text(lines, align === 'center' ? pageWidth / 2 : LEFT + indent, y, { align });
    y += lines.length * lineHeight + gap;
  };

  const section = (heading) => {
    if (!text(heading)) return;
    ensureSpace(11);
    y += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(heading.toUpperCase(), LEFT, y);
    y += 1.5;
    pdf.setDrawColor(60, 60, 60);
    pdf.setLineWidth(0.25);
    pdf.line(LEFT, y, pageWidth - LEFT, y);
    y += 4;
  };

  const person = resumeData.personalInfo || {};
  write(person.fullName || 'Your Name', { bold: true, size: 18, gap: 1, align: 'center' });
  write([person.professionalTitle, person.email, person.phone, person.location, person.linkedin, person.github, person.portfolio]
    .map(text).filter(Boolean).join(' | '), { size: 9, gap: 4, align: 'center' });

  if (text(resumeData.professionalSummary)) {
    section('Professional Summary');
    write(resumeData.professionalSummary, { size: 9, gap: 2 });
  }

  if (resumeData.skills?.some((skill) => text(skill))) {
    section('Technical Skills');
    write(resumeData.skills.map(text).filter(Boolean).join(' | '));
  }

  if (resumeData.certifications?.length) {
    section('Certifications');
    resumeData.certifications.forEach((certification) => {
      const name = typeof certification === 'string' ? certification : certification.name || certification.title;
      write([name, certification.issuer, certification.date].map(text).filter(Boolean).join(' | '), { bold: true });
      if (typeof certification === 'object') write(certification.description, { indent: 2 });
    });
  }

  if (resumeData.experience?.length) {
    section('Professional Experience');
    resumeData.experience.forEach((experience) => {
      write([experience.role, experience.company].map(text).filter(Boolean).join(' | '), { bold: true });
      write([experience.location, formatDate(experience.startDate), formatDate(experience.endDate)].filter(Boolean).join(' | '), { size: 8 });
      write(experience.description, { indent: 2 });
    });
  }

  if (resumeData.projects?.length) {
    section('Projects');
    resumeData.projects.forEach((project) => {
      write([project.name, project.organization].map(text).filter(Boolean).join(' | '), { bold: true });
      write([project.technologies, project.githubLink, project.liveLink].map(text).filter(Boolean).join(' | '), { size: 8 });
      write(project.description, { indent: 2 });
    });
  }

  if (resumeData.achievements?.length) {
    section('Achievements');
    resumeData.achievements.forEach((achievement) => {
      const value = typeof achievement === 'string' ? achievement : achievement.title || achievement.name;
      write(value, { indent: 2 });
    });
  }

  if (resumeData.education?.length) {
    section('Education');
    resumeData.education.forEach((education) => {
      write([education.degree, education.field].map(text).filter(Boolean).join(' in '), { bold: true });
      write([education.institution, education.startYear, education.endYear, education.cgpa && `CGPA: ${education.cgpa}`]
        .map(text).filter(Boolean).join(' | '), { size: 8 });
    });
  }

  return pdf;
};

export async function downloadResumePdf(resumeData) {
  if (!text(resumeData.personalInfo?.fullName)) {
    throw new Error('Add your full name before downloading your resume.');
  }
  const filename = `${text(resumeData.personalInfo.fullName).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'resume'}-resume.pdf`;
  (await createResumePdf(resumeData)).save(filename);
}