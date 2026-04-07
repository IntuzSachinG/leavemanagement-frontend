export function getDepartmentName(
  departmentId: string,
  departments: Array<{ id: string; name: string }>,
) {
  return (
    departments.find((department) => department.id === departmentId)?.name ??
    "Unassigned"
  );
}
