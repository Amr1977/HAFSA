export const calculateIddahEndsAt = (
  maritalStatus: string,
  lastDivorceDate?: string | null,
  husbandDeathDate?: string | null
): { iddahEndsAt: Date | null; iddahComplete: boolean } => {
  const now = new Date();

  if (maritalStatus === 'مطلقة' && lastDivorceDate) {
    const divorceDate = new Date(lastDivorceDate);
    if (!isNaN(divorceDate.getTime())) {
      const iddahEndsAt = new Date(divorceDate);
      iddahEndsAt.setDate(iddahEndsAt.getDate() + 90);
      return { iddahEndsAt, iddahComplete: now >= iddahEndsAt };
    }
  }

  if (maritalStatus === 'أرملة' && husbandDeathDate) {
    const deathDate = new Date(husbandDeathDate);
    if (!isNaN(deathDate.getTime())) {
      const iddahEndsAt = new Date(deathDate);
      iddahEndsAt.setDate(iddahEndsAt.getDate() + 130);
      return { iddahEndsAt, iddahComplete: now >= iddahEndsAt };
    }
  }

  return { iddahEndsAt: null, iddahComplete: true };
};