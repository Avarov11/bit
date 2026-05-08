import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getStats() {
  const today = new Date().toISOString().split("T")[0];
  const admin = getAdmin();

  const [{ count: totalOrders }, { count: todayOrders }, { count: pendingOrders }, { data: revenue }] =
    await Promise.all([
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }).eq("pickup_date", today),
      admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("orders").select("total"),
    ]);

  const totalRevenue = revenue?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  return { totalOrders, todayOrders, pendingOrders, totalRevenue };
}

export default async function DashboardPage() {
  const { totalOrders, todayOrders, pendingOrders, totalRevenue } = await getStats();

  const stats = [
    { label: "Total Orders",    value: totalOrders   ?? 0               },
    { label: "Today's Pickups", value: todayOrders   ?? 0               },
    { label: "Pending",         value: pendingOrders ?? 0               },
    { label: "Revenue (QAR)",   value: `${totalRevenue.toFixed(0)} QAR` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm text-gray-400">
          Use the sidebar to manage <strong>Orders</strong> and <strong>Products</strong>.
        </p>
      </div>
    </div>
  );
}
