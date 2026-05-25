import { priceLabel } from '@/lib/constants';

export default function BadgeGroup({ pricingTier, chinaAccessible, beginnerFriendly, ecommerceRelevant, size = 'sm' }: {
  pricingTier: string;
  chinaAccessible?: boolean;
  beginnerFriendly?: boolean;
  ecommerceRelevant?: boolean;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'md' ? 'text-sm px-3 py-1' : 'text-[10px]';
  return (
    <>
      <span className={`badge ${sizeClass} ${
        pricingTier === 'completely_free' || pricingTier === 'open_source'
          ? 'badge-green' : pricingTier === 'freemium' ? 'badge-yellow' : 'badge'
      }`}>{priceLabel[pricingTier] || pricingTier}</span>
      {chinaAccessible && <span className={`badge-green ${sizeClass}`}>国内可用</span>}
      {beginnerFriendly && <span className={`badge-blue ${sizeClass}`}>小白友好</span>}
      {ecommerceRelevant && <span className={`badge-purple ${sizeClass}`}>{size === 'md' ? '电商相关' : '电商'}</span>}
    </>
  );
}
