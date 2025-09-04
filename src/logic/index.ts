export const getDate = (): string => {
  const today = new Date()
  return today.toLocaleDateString('es')
}