export const formatPrice = (value?: number) => {
  const price = value ?? 0;
  return `${price.toLocaleString('vi-VN')}đ`;
};
