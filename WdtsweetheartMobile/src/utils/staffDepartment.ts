export const isServiceDepartment = (roles: any[]): boolean => {
  if (!Array.isArray(roles) || roles.length === 0) return false;

  const keywords = ['dich vu', 'service', 'grooming', 'spa', 'thu y', 'vet'];

  return roles.some((role) => {
    const raw = String(role?.departmentId?.name || role?.departmentId?.code || '').toLowerCase();
    return keywords.some((keyword) => raw.includes(keyword));
  });
};
