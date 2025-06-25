import { CompanyNewProductClient } from "@/components/company-new-product-client";
import { mockIndustries, mockCategories } from "@/lib/mock-data";
import type { Industry, ProductCategory } from "@/lib/types";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Product',
};

// In a real app, this configuration would be fetched based on the logged-in company's profile.
// This is where the Admin's configuration would control what this company can see.
const MOCK_COMPANY_SCOPE = {
    // We are simulating that the admin has only granted "UltraCell GmbH" access to the Battery industry.
    allowedIndustryCodes: ['BAT'], 
};

export default function CompanyNewProductPage() {

  const scopedIndustries = mockIndustries.filter(i => MOCK_COMPANY_SCOPE.allowedIndustryCodes.includes(i.industry_code));
  const scopedIndustryIds = scopedIndustries.map(i => i.industry_id);
  const scopedCategories = mockCategories.filter(c => scopedIndustryIds.includes(c.industry_id));
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Create New Product
        </h1>
      </div>
      <p className="text-muted-foreground max-w-4xl">
        Start by defining a new product and its core metadata based on your company's approved categories.
      </p>
      <CompanyNewProductClient 
        industries={scopedIndustries}
        categories={scopedCategories}
      />
    </main>
  );
}
