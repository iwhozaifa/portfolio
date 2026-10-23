// Facts about Ali Huzaifa used across the site. Values marked pending are still to come from him.
export const site = {
  name: 'Ali Huzaifa',
  urduName: 'علی حذیفہ',
  email: 'alihuzaifa7204@gmail.com',
  github: 'https://github.com/iwhozaifa',
  linkedin: null as string | null, // pending
  resume: null as string | null, // pending
  place: 'Pakistan',
  studies: 'Software engineering student in Pakistan.', // pending: university, programme, year
  timeZone: 'Asia/Karachi',
};

const subject = encodeURIComponent('Project enquiry');
const body = encodeURIComponent('Hi Ali Huzaifa,\n\nWhat I want to build:\n\nTimeline:\n\nBudget:\n');
export const projectMailto = `mailto:${site.email}?subject=${subject}&body=${body}`;
