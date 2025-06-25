import { SupplierMaterialFormClient } from "@/components/supplier-material-form-client";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create New Material',
};

export default function NewMaterialPage() {
  return <SupplierMaterialFormClient />;
}
