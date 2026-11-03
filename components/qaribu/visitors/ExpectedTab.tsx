import React, { useEffect, useState } from 'react';
import * as api from '../../../services/visitorsApi';
import { clock } from './shared';

const STATUS_LABEL: Record<api.VisitStatus, string> = {
  waiting: 'Waiting',
  arrived: 'Arrived',
  left: 'Left',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<api.VisitStatus, string> = {
  waiting: 'bg-amber-100 text-amber-800',
  arrived: 'bg-green-100 text-green-800',
  left: 'bg-gray-200 text-gray-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

const Row: React.FC<{ p: api.PassRow; logTimes: boolean }> = ({ p, logTimes }) => (
  <div data-testid="expected-row" className="bg-white rounded-xl shadow p-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-gray-900">{p.visitor_name}</p>
        {p.visitor_phone && <p className="text-xs text-gray-500">{p.visitor_phone}</p>}
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
    </div>
    <p className="text-sm text-gray-700 mt-2">{p.purpose}</p>
    {p.host_label && <p className="text-xs text-gray-500">{p.mine ? 'Invited by' : 'Host:'} {p.host_label}</p>}
    {logTimes && (p.arrived_at || p.left_at) && (
      <p className="text-xs text-gray-600 mt-2">
        {p.arrived_at && <>In {clock(p.arrived_at)}</>}
        {p.left_at && <> · Out {clock(p.left_at)}</>}
      </p>
    )}
    {p.key && (
      <p className="text-xs text-gray-600 mt-2">
        Key <span className="font-bold tracking-widest">{p.key}</span> · valid until {clock(p.expires_at)}
      </p>
    )}
  </div>
);

// The host's own expected visitors. Who a host is expecting is between the host and the visitor, so nobody else sees an
// invite while it is only expected. An owner or manager also sees other hosts' visitors afterwards, once the code was
// used at the gate, as the premise's record. Check-in and check-out times appear only when the premise records them.
const ExpectedTab: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [data, setData] = useState<{ log_times: boolean; passes: api.PassRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .getPasses(premise.slug)
      .then((res) => setData({ log_times: res.premise.log_times, passes: res.passes }))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [premise.slug]);

  return (
    <div className="space-y-3">
      <button onClick={load} disabled={loading} className="text-sm text-blue-600 hover:underline">
        {loading ? 'Refreshing…' : 'Refresh'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && !loading && data.passes.filter((p) => p.mine).length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">You have no visitors in the last 7 days. Only you and your visitor know who you are expecting.</div>
      )}

      {data?.passes.filter((p) => p.mine).map((p) => <Row key={p.id} p={p} logTimes={data.log_times} />)}

      {data && data.passes.some((p) => !p.mine) && (
        <section className="space-y-3 pt-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Visits to this premise</h2>
            <p className="text-xs text-gray-500">Other hosts' visitors, listed only after their code was used at the gate. You do not see who anyone is expecting.</p>
          </div>
          {data.passes.filter((p) => !p.mine).map((p) => <Row key={p.id} p={p} logTimes={data.log_times} />)}
        </section>
      )}
    </div>
  );
};

export default ExpectedTab;
