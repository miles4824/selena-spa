// =============================================================
// COMPONENT: RETAIL PRODUCT PICKER (Sản phẩm bán kèm)
// =============================================================
function renderRetailProductList(products, selectedProductIds = [], onToggleFn) {
  return products.map(p => {
    const isSelected = selectedProductIds.includes(p.service_id);
    return `
      <button type="button" onclick="${onToggleFn}('${p.service_id}')" class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${isSelected ? 'bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B]' : 'bg-[#FAF6F1] border-[#EFE8DF] text-[#7E7272]'}">
        <span>🧴 ${p.service_name}</span>
        <span>+${Number(p.price).toLocaleString('vi-VN')} đ</span>
      </button>
    `;
  }).join('');
}
