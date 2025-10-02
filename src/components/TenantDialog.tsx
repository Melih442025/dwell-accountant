import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  apartments: any[];
  onSave: () => void;
}

const TenantDialog = ({ open, onOpenChange, tenant, apartments, onSave }: TenantDialogProps) => {
  const [formData, setFormData] = useState({
    apartment_id: "",
    name: "",
    email: "",
    phone: "",
    move_in_date: "",
    move_out_date: "",
    monthly_rent: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tenant) {
      setFormData({
        apartment_id: tenant.apartment_id,
        name: tenant.name,
        email: tenant.email || "",
        phone: tenant.phone || "",
        move_in_date: tenant.move_in_date,
        move_out_date: tenant.move_out_date || "",
        monthly_rent: tenant.monthly_rent.toString(),
        status: tenant.status,
      });
    } else {
      setFormData({
        apartment_id: "",
        name: "",
        email: "",
        phone: "",
        move_in_date: "",
        move_out_date: "",
        monthly_rent: "",
        status: "active",
      });
    }
  }, [tenant]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        monthly_rent: parseFloat(formData.monthly_rent) || 0,
        move_out_date: formData.move_out_date || null,
        status: formData.status as "active" | "inactive" | "pending",
      };

      if (tenant) {
        const { error } = await supabase
          .from("tenants")
          .update(data)
          .eq("id", tenant.id);
        if (error) throw error;
        toast({ title: "Tenant updated successfully" });
      } else {
        const { error } = await supabase.from("tenants").insert([data]);
        if (error) throw error;
        toast({ title: "Tenant added successfully" });
      }
      onSave();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tenant ? "Edit Tenant" : "Add New Tenant"}</DialogTitle>
          <DialogDescription>
            Fill in the tenant information below
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apartment">Apartment</Label>
            <Select
              value={formData.apartment_id}
              onValueChange={(value) => setFormData({ ...formData, apartment_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select apartment" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {apt.apartment_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rent">Monthly Rent</Label>
              <Input
                id="rent"
                type="number"
                step="0.01"
                value={formData.monthly_rent}
                onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="move_in">Move In Date</Label>
              <Input
                id="move_in"
                type="date"
                value={formData.move_in_date}
                onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="move_out">Move Out Date (Optional)</Label>
              <Input
                id="move_out"
                type="date"
                value={formData.move_out_date}
                onChange={(e) => setFormData({ ...formData, move_out_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDialog;