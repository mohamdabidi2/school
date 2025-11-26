"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface CardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  badge?: {
    text: string;
    color: string;
  };
  details?: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant: 'primary' | 'secondary' | 'danger' | 'success';
  }>;
}

interface MobileDataCardsProps {
  title: string;
  subtitle?: string;
  items: CardItem[];
  totalCount?: number;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const MobileDataCards = ({
  title,
  subtitle,
  items,
  totalCount,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: MobileDataCardsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      // Default pagination using URL search params
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.push(`?${params.toString()}`);
    }
  };
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'secondary':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'danger':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'success':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
        {totalCount !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} élément{totalCount > 1 ? 's' : ''} trouvé{totalCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200">
            <div className="flex items-start space-x-4">
              {/* Image/Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                {item.image ? (
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    width={64} 
                    height={64}
                    className="object-cover w-16 h-16"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {item.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  )}
                </div>
                
                {item.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.subtitle}
                  </p>
                )}
                
                {item.description && (
                  <p className="text-sm text-gray-500 mt-2">
                    {item.description}
                  </p>
                )}
                
                {item.details && item.details.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.details.map((detail, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <Image src={detail.icon} alt={detail.label} width={16} height={16} className="mr-2" />
                        <span>{detail.label}: {detail.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {item.actions && item.actions.length > 0 && (
              <div className="mt-4 flex justify-end space-x-2">
                {item.actions.map((action, index) => (
                  action.href ? (
                    <Link
                      key={index}
                      href={action.href}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${getVariantClasses(action.variant)}`}
                    >
                      {action.label}
                    </Link>
                  ) : (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${getVariantClasses(action.variant)}`}
                    >
                      {action.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDataCards;
