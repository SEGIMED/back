export function calculateAge(birthDate: Date): number {
  if (!birthDate) return 0;

  const today = new Date();

  const birth = new Date(birthDate);

  if (isNaN(birth.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}
