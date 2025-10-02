import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BillingOverview = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBillingRecords();
  }, []);

  const loadBillingRecords = async () => {
    const { data } = await supabase
      .from("billing_records")
      .select(`
        *,
        tenant:tenants(name, apartment:apartments(apartment_number))
      `)
      .eq("month", currentMonth)
      .eq("year", currentYear);
    
    setBillingRecords(data || []);
  };

  const calculateBilling = async () => {
    setLoading(true);
    try {
      // Get utility prices
      const { data: prices } = await supabase
        .from("utility_prices")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();

      if (!prices) {
        toast({
          title: "Please set utility prices first",
          variant: "destructive",
        });
        return;
      }

      // Get all active tenants
      const { data: tenants } = await supabase
        .from("tenants")
        .select("*, apartment:apartments(*)")
        .eq("status", "active");

      if (!tenants || tenants.length === 0) {
        toast({
          title: "No active tenants found",
          variant: "destructive",
        });
        return;
      }

      // Get all consumption data
      const { data: consumption } = await supabase
        .from("utility_consumption")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear);

      const consumptionMap = new Map(consumption?.map(c => [c.apartment_id, c]) || []);

      // Calculate prorated days
      const getDaysInMonth = () => new Date(currentYear, currentMonth, 0).getDate();
      const totalDaysInMonth = getDaysInMonth();

      const billingData = tenants.map(tenant => {
        const moveInDate = new Date(tenant.move_in_date);
        const moveOutDate = tenant.move_out_date ? new Date(tenant.move_out_date) : null;
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0);

        let daysOccupied = totalDaysInMonth;
        
        // Calculate prorated days
        if (moveInDate > monthStart && moveInDate <= monthEnd) {
          daysOccupied = monthEnd.getDate() - moveInDate.getDate() + 1;
        }
        if (moveOutDate && moveOutDate >= monthStart && moveOutDate < monthEnd) {
          daysOccupied = moveOutDate.getDate();
        }

        const prorateRatio = daysOccupied / totalDaysInMonth;

        // Get consumption data
        const aptConsumption = consumptionMap.get(tenant.apartment_id) || {
          water_consumption: 0,
          electricity_consumption: 0,
        };

        // Calculate individual utilities
        const waterIndividual = Number(aptConsumption.water_consumption) * Number(prices.water_price_per_unit);
        const electricityIndividual = Number(aptConsumption.electricity_consumption) * Number(prices.electricity_price_per_unit);

        // Calculate shared utilities (prorated)
        const sharedWaterPerApartment = Number(prices.total_building_water) / tenants.length;
        const sharedElectricityPerApartment = Number(prices.total_building_electricity) / tenants.length;
        
        const waterShared = sharedWaterPerApartment * prorateRatio;
        const electricityShared = sharedElectricityPerApartment * prorateRatio;

        // Calculate prorated charges
        const rentAmount = Number(tenant.monthly_rent) * prorateRatio;
        const maintenanceFee = Number(prices.monthly_maintenance_fee) * prorateRatio;
        const gasAmount = Number(prices.gas_price) * prorateRatio;

        const totalAmount = rentAmount + waterIndividual + waterShared + 
                           electricityIndividual + electricityShared + gasAmount + maintenanceFee;

        return {
          tenant_id: tenant.id,
          month: currentMonth,
          year: currentYear,
          rent_amount: rentAmount,
          water_individual: waterIndividual,
          water_shared: waterShared,
          electricity_individual: electricityIndividual,
          electricity_shared: electricityShared,
          gas_amount: gasAmount,
          maintenance_fee: maintenanceFee,
          total_amount: totalAmount,
          paid_amount: 0,
          days_occupied: daysOccupied,
          total_days_in_month: totalDaysInMonth,
        };
      });

      // Upsert billing records
      const { error } = await supabase
        .from("billing_records")
        .upsert(billingData, {
          onConflict: "tenant_id,month,year",
        });

      if (error) throw error;

      toast({ title: "Billing calculated successfully" });
      loadBillingRecords();
    } catch (error: any) {
      toast({
        title: "Error calculating billing",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (record: any) => {
    const total = Number(record.total_amount);
    const paid = Number(record.paid_amount);
    
    if (paid >= total) return { label: "Paid", variant: "default" as const };
    if (paid > 0) return { label: "Partial", variant: "secondary" as const };
    return { label: "Pending", variant: "outline" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing Overview</CardTitle>
            <CardDescription>
              Monthly billing for {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <Button onClick={calculateBilling} disabled={loading}>
            <Calculator className="w-4 h-4 mr-2" />
            {loading ? "Calculating..." : "Calculate Billing"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apartment</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead>Utilities</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingRecords.map((record) => {
              const status = getPaymentStatus(record);
              const utilities = Number(record.water_individual) + Number(record.water_shared) + 
                               Number(record.electricity_individual) + Number(record.electricity_shared) + 
                               Number(record.gas_amount);
              
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.tenant?.apartment?.apartment_number || "N/A"}
                  </TableCell>
                  <TableCell>{record.tenant?.name || "N/A"}</TableCell>
                  <TableCell>${Number(record.rent_amount).toFixed(2)}</TableCell>
                  <TableCell>${utilities.toFixed(2)}</TableCell>
                  <TableCell>${Number(record.maintenance_fee).toFixed(2)}</TableCell>
                  <TableCell className="font-bold">${Number(record.total_amount).toFixed(2)}</TableCell>
                  <TableCell className="text-success">${Number(record.paid_amount).toFixed(2)}</TableCell>
                  <TableCell>{record.days_occupied}/{record.total_days_in_month}</TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BillingOverview;