'use client'
import { useState } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Check, X, IndianRupee } from 'lucide-react';

interface QuotationRequest {
  id: string;
  requestId: string;
  vendorName: string;
  department: string;
  category: string;
  requestDate: string;
  totalAmount: number;
  itemCount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const mockRequests: QuotationRequest[] = [
  {
    id: '1',
    requestId: 'QR-2026-001',
    vendorName: 'Tech Solutions India Pvt Ltd',
    department: 'Computer Science',
    category: 'Lab Equipment',
    requestDate: '2026-03-18',
    totalAmount: 245000,
    itemCount: 15,
    description: 'Computer lab equipment including monitors, keyboards, and accessories',
    status: 'Pending',
  },
  {
    id: '2',
    requestId: 'QR-2026-002',
    vendorName: 'EduSoft Technologies',
    department: 'IT Department',
    category: 'Software',
    requestDate: '2026-03-17',
    totalAmount: 180000,
    itemCount: 5,
    description: 'Annual software licenses for development tools and IDEs',
    status: 'Pending',
  },
  {
    id: '3',
    requestId: 'QR-2026-003',
    vendorName: 'Research Equipment Co.',
    department: 'Physics',
    category: 'Research',
    requestDate: '2026-03-16',
    totalAmount: 520000,
    itemCount: 8,
    description: 'Laboratory instruments for quantum physics research',
    status: 'Pending',
  },
  {
    id: '4',
    requestId: 'QR-2026-004',
    vendorName: 'Office Mart India',
    department: 'Administration',
    category: 'Infrastructure',
    requestDate: '2026-03-15',
    totalAmount: 95000,
    itemCount: 25,
    description: 'Office furniture and fixtures for new administrative block',
    status: 'Pending',
  },
  {
    id: '5',
    requestId: 'QR-2026-005',
    vendorName: 'Academic Publishers Ltd',
    department: 'Library',
    category: 'Student',
    requestDate: '2026-03-14',
    totalAmount: 125000,
    itemCount: 150,
    description: 'Academic books and journals for library',
    status: 'Pending',
  }
];

export default function Page() {
  const [requests, setRequests] = useState<QuotationRequest[]>(mockRequests);

  const handleApprove = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'Approved' as const } : req
    ));
  };

  const handleReject = (requestId: string) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'Rejected' as const } : req
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Principal Verification</h1>
            <p className="text-gray-600">Review and approve quotation requests</p>
          </div>

          {/* Requests List */}
          <div className="space-y-4 max-w-4xl">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{request.requestId}</h3>
                    <p className="text-gray-600">{request.vendorName}</p>
                    <p className="text-sm text-gray-500">{request.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-xl text-gray-900">
                      <IndianRupee className="w-5 h-5" />
                      {request.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <p className="text-sm text-gray-500">{request.itemCount} items</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{request.description}</p>

                {request.status === 'Pending' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg text-center font-medium ${
                    request.status === 'Approved' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {request.status === 'Approved' ? '✓ Approved' : '✗ Rejected'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}