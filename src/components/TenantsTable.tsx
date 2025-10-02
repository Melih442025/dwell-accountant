import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import TenantDialog from "./TenantDialog";
import { useToast } from "@/hooks/use-toast";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  move_in_date: string;
  move_out_date: string | null;
  monthly_rent: number;
  status: string;
  apartment_id: string;
}

interface TenantsTableProps {
  onUpdate?: () => void;
}

const TenantsTable = ({ onUpdate }: TenantsTableProps) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTenants();
    loadApartments();
  }, []);

  const loadTenants = async () => {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({
        title: "Error loading tenants",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setTenants(data || []);
  };

  const loadApartments = async () => {
    const { data } = await supabase.from("apartments").select("*");
    setApartments(data || []);
  };

  const getApartmentNumber = (apartmentId: string) => {
    return apartments.find((a) => a.id === apartmentId)?.apartment_number || "N/A";
  };

  const handleSave = async () => {
    await loadTenants();
    setDialogOpen(false);
    setSelectedTenant(null);
    onUpdate?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenants</CardTitle>
              <CardDescription>Manage apartment tenants and their information</CardDescription>
            </div>
            <Button onClick={() => {
              setSelectedTenant(null);
              setDialogOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apartment</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Move In Date</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    {getApartmentNumber(tenant.apartment_id)}
                  </TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.email}</TableCell>
                  <TableCell>{tenant.phone}</TableCell>
                  <TableCell>{new Date(tenant.move_in_date).toLocaleDateString()}</TableCell>
                  <TableCell>${Number(tenant.monthly_rent).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={tenant.status === "active" ? "default" : "secondary"}>
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTenant(tenant);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TenantDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenant={selectedTenant}
        apartments={apartments}
        onSave={handleSave}
      />
    </>
  );
};

export default TenantsTable;