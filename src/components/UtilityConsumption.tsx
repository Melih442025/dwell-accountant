import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const UtilityConsumption = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [apartments, setApartments] = useState<any[]>([]);
  const [selectedApartment, setSelectedApartment] = useState("");
  const [formData, setFormData] = useState({
    water_consumption: "",
    electricity_consumption: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadApartments();
  }, []);

  useEffect(() => {
    if (selectedApartment) {
      loadConsumption();
    }
  }, [selectedApartment]);

  const loadApartments = async () => {
    const { data } = await supabase.from("apartments").select("*").order("apartment_number");
    setApartments(data || []);
  };

  const loadConsumption = async () => {
    const { data } = await supabase
      .from("utility_consumption")
      .select("*")
      .eq("apartment_id", selectedApartment)
      .eq("month", currentMonth)
      .eq("year", currentYear)
      .maybeSingle();

    if (data) {
      setFormData({
        water_consumption: data.water_consumption.toString(),
        electricity_consumption: data.electricity_consumption.toString(),
      });
    } else {
      setFormData({
        water_consumption: "",
        electricity_consumption: "",
      });
    }
  };

  const handleSave = async () => {
    if (!selectedApartment) {
      toast({
        title: "Please select an apartment",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        apartment_id: selectedApartment,
        month: currentMonth,
        year: currentYear,
        water_consumption: parseFloat(formData.water_consumption) || 0,
        electricity_consumption: parseFloat(formData.electricity_consumption) || 0,
      };

      const { error } = await supabase
        .from("utility_consumption")
        .upsert(data, {
          onConflict: "apartment_id,month,year",
        });

      if (error) throw error;
      toast({ title: "Consumption data saved successfully" });
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
        <CardTitle>Utility Consumption</CardTitle>
        <CardDescription>
          Enter utility consumption for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Select Apartment</Label>
            <Select value={selectedApartment} onValueChange={setSelectedApartment}>
              <SelectTrigger>
                <SelectValue placeholder="Choose apartment" />
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

          {selectedApartment && (
            <>
              <div className="grid gap-2">
                <Label>Water Consumption (units)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.water_consumption}
                  onChange={(e) => setFormData({ ...formData, water_consumption: e.target.value })}
                  placeholder="Enter water consumption"
                />
              </div>

              <div className="grid gap-2">
                <Label>Electricity Consumption (kWh)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.electricity_consumption}
                  onChange={(e) => setFormData({ ...formData, electricity_consumption: e.target.value })}
                  placeholder="Enter electricity consumption"
                />
              </div>
            </>
          )}
        </div>

        <Button onClick={handleSave} disabled={loading || !selectedApartment} className="w-full">
          {loading ? "Saving..." : "Save Consumption"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UtilityConsumption;