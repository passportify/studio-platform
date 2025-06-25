import { SupplierMaterialFormClient } from "@/components/supplier-material-form-client";
import type { MaterialSpecification } from "@/lib/types";
import { mockSupplierMaterialSpecs } from "@/lib/mock-data";
import type { Metadata } from 'next';

type Props = {
  params: { materialId: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const material = mockSupplierMaterialSpecs.find(m => m.material_id === params.materialId);
  const materialName = material ? material.material_name : "Material";

  return {
    title: `Edit: ${materialName}`,
  };
}

export default function EditMaterialPage({ params }: { params: { materialId: string } }) {
  const material = mockSupplierMaterialSpecs.find(m => m.material_id === params.materialId);

  if (!material) {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="text-center text-red-500">
                Material not found.
            </div>
        </main>
    )
  }
  
  return <SupplierMaterialFormClient material={material} />;
}
