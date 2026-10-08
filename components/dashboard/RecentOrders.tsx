const ORDERS = [
  { id: '#ORD-1024', restaurant: 'Thamel Bites', amount: 'Rs. 2,450', status: 'completed', time: '2m ago' },
  { id: '#ORD-1023', restaurant: 'Himalayan Kitchen', amount: 'Rs. 1,890', status: 'preparing', time: '8m ago' },
  { id: '#ORD-1022', restaurant: 'Kathmandu Cafe', amount: 'Rs. 3,200', status: 'pending', time: '15m ago' },
  { id: '#ORD-1021', restaurant: 'Pokhara Grill', amount: 'Rs. 980', status: 'completed', time: '22m ago' },
  { id: '#ORD-1020', restaurant: 'Lalitpur Lounge', amount: 'Rs. 5,100', status: 'cancelled', time: '35m ago' },
];

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-50 text-green-700 border-green-200',
  preparing: 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function RecentOrders() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-xs text-gray-500 mt-0.5">Latest orders across all restaurants</p>
        </div>
        <button className="text-xs font-medium text-orange-600 hover:text-orange-700">
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-medium text-gray-900">
                  {order.id}
                </td>
                <td className="px-5 py-3 text-sm text-gray-700">{order.restaurant}</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                  {order.amount}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{order.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}