import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ChevronsRight, Library } from "lucide-react";
import Link from "next/link";
import { format } from 'date-fns';
import type { MaterialSpecification } from "@/lib/types";
import { mockSupplierMaterialSpecs } from "@/lib/mock-data";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Material Library',
};

export default function MyMaterialsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            My Material Library
          </h1>
           <p className="text-muted-foreground max-w-4xl">
            This is your central, reusable library of material specifications. Data entered here can be quickly used to fulfill requests from any of your customers on the Passportify platform, saving you time and ensuring consistency.
          </p>
        </div>
        <Button asChild>
          <Link href="/supplier-portal/my-materials/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Material
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Materials</CardTitle>
          <CardDescription>A list of all materials you have pre-defined in your library.</CardDescription>
        </CardHeader>
        <CardContent>
            {mockSupplierMaterialSpecs.length > 0 ? (
                <div className="space-y-4">
                    {mockSupplierMaterialSpecs.map((material) => (
                        <Link key={material.material_id} href={`/supplier-portal/my-materials/${material.material_id}`} className="block rounded-lg border hover:bg-muted/50 transition-colors">
                           <div className="p-4 flex items-center justify-between">
                               <div>
                                    <p className="font-semibold text-primary">{material.material_name}</p>
                                    <p className="text-sm text-muted-foreground">{material.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Last updated: {format(new Date(material.last_updated_at), "PPP")}</p>
                               </div>
                               <ChevronsRight className="h-5 w-5 text-muted-foreground" />
                           </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Library className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Your Material Library is Empty</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground">
                        Add a material to get started. Data entered here can be reused for all your customers.
                    </p>
                    <Button asChild>
                        <Link href="/supplier-portal/my-materials/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Material
                        </Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
    </main>
  );
}
