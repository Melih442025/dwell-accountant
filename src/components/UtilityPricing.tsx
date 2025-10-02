import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const UtilityPricing = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    water_price_per_unit: "",
    electricity_price_per_unit: "",
    gas_price: "",
    monthly_maintenance_fee: "",
    total_building_water: "",
    total_building_electricity: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    const { data } = await supabase
      .from("utility_prices")
      .select("*")
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .single();

    if (data) {
      setFormData({
        water_price_per_unit: data.water_price_per_unit.toString(),
        electricity_price_per_unit: data.electricity_price_per_unit.toString(),
        gas_price: data.gas_price.toString(),
        monthly_maintenance_fee: data.monthly_maintenance_fee.toString(),
        total_building_water: data.total_building_water.toString(),
        total_building_electricity: data.total_building_electricity.toString(),
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        month: currentMonth,
        year: currentYear,
        water_price_per_unit: parseFloat(formData.water_price_per_unit) || 0,
        electricity_price_per_unit: parseFloat(formData.electricity_price_per_unit) || 0,
        gas_price: parseFloat(formData.gas_price) || 0,
        monthly_maintenance_fee: parseFloat(formData.monthly_maintenance_fee) || 0,
        total_building_water: parseFloat(formData.total_building_water) || 0,
        total_building_electricity: parseFloat(formData.total_building_electricity) || 0,
      };

      const { error } = await supabase
        .from("utility_prices")
        .upsert(data, {
          onConflict: "month,year",
        });

      if (error) throw error;
      toast({ title: "Utility pricing updated successfully" });
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
    <Card>
      <CardHeader>
        <CardTitle>Utility Pricing</CardTitle>
        <CardDescription>
          Set utility prices for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Water Price (per unit)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.water_price_per_unit}
              onChange={(e) => setFormData({ ...formData, water_price_per_unit: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Electricity Price (per kWh)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.electricity_price_per_unit}
              onChange={(e) => setFormData({ ...formData, electricity_price_per_unit: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Gas Price (flat rate per apartment)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.gas_price}
              onChange={(e) => setFormData({ ...formData, gas_price: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Monthly Maintenance Fee</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.monthly_maintenance_fee}
              onChange={(e) => setFormData({ ...formData, monthly_maintenance_fee: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Total Building Water Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.total_building_water}
              onChange={(e) => setFormData({ ...formData, total_building_water: e.target.value })}
              placeholder="Shared water costs"
            />
          </div>

          <div className="grid gap-2">
            <Label>Total Building Electricity Cost</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.total_building_electricity}
              onChange={(e) => setFormData({ ...formData, total_building_electricity: e.target.value })}
              placeholder="Shared electricity costs"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Pricing"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UtilityPricing;