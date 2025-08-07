import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2,
  BarChart3,
  Zap,
  Loader2
} from 'lucide-react';
import { Button, Card } from '../ui';
import { compilationQueue, type CompilationJob, type QueueStats, type BatchCompilationRequest } from '../../services/compilationQueue';

export function QueueManagementPanel() {
  const [queue, setQueue] = useState<CompilationJob[]>([]);
  const [history, setHistory] = useState<CompilationJob[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<('marketing' | 'market-intel' | 'product-strategy')[]>([]);
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  // Load queue data
  const loadQueueData = async () => {
    setIsLoading(true);
    try {
      const [queueData, historyData, statsData] = await Promise.all([
        compilationQueue.getQueue(),
        compilationQueue.getCompletedJobs(),
        compilationQueue.getQueueStats()
      ]);
      
      setQueue(queueData);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load queue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh queue data
  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Add jobs to queue
  const addToQueue = async () => {
    if (selectedProducts.length === 0 || selectedTypes.length === 0) {
      alert('Please select at least one product and compilation type');
      return;
    }

    setIsLoading(true);
    try {
      const request: BatchCompilationRequest = {
        productIds: selectedProducts,
        types: selectedTypes,
        priority
      };

      await compilationQueue.addToQueue(request);
      await loadQueueData();
      
      // Reset selections
      setSelectedProducts([]);
      setSelectedTypes([]);
      setPriority('normal');
    } catch (error) {
      console.error('Failed to add jobs to queue:', error);
      alert('Failed to add jobs to queue');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel job
  const cancelJob = async (jobId: string) => {
    try {
      await compilationQueue.cancelJob(jobId);
      await loadQueueData();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  // Retry failed job
  const retryJob = async (jobId: string) => {
    try {
      await compilationQueue.retryJob(jobId);
      await loadQueueData();
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  // Cancel all jobs
  const cancelAllJobs = async () => {
    if (!confirm('Are you sure you want to cancel all queued jobs?')) {
      return;
    }

    try {
      const cancelledCount = await compilationQueue.cancelAllJobs();
      await loadQueueData();
      alert(`Cancelled ${cancelledCount} jobs`);
    } catch (error) {
      console.error('Failed to cancel all jobs:', error);
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear job history older than 30 days?')) {
      return;
    }

    try {
      const removedCount = await compilationQueue.clearHistory(30);
      await loadQueueData();
      alert(`Cleared ${removedCount} old jobs from history`);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // Get status icon
  const getStatusIcon = (status: CompilationJob['status']) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Get status color
  const getStatusColor = (status: CompilationJob['status']) => {
    switch (status) {
      case 'queued': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Format duration
  const formatDuration = (startedAt?: string, completedAt?: string) => {
    if (!startedAt) return '-';
    
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Compilation Queue Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor compilation jobs with priority queuing and retry logic
          </p>
        </div>
        <Button onClick={loadQueueData} disabled={isLoading}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Queue Statistics */}
      {stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Queue Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.queued + stats.processing}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
          {stats.averageProcessingTime > 0 && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-600">
                Average Processing Time: {Math.round(stats.averageProcessingTime / 1000)}s
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add Jobs to Queue */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Jobs to Queue</h3>
        
        {/* Product Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Products
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['01_ai_power_hour', '02_ai_b_c', '03_ai_innovation_programme'].map(productId => (
              <label key={productId} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(productId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts([...selectedProducts, productId]);
                    } else {
                      setSelectedProducts(selectedProducts.filter(id => id !== productId));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{productId}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Compilation Types */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Compilation Types
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['marketing', 'market-intel', 'product-strategy'] as const).map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTypes([...selectedTypes, type]);
                    } else {
                      setSelectedTypes(selectedTypes.filter(t => t !== type));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <Button onClick={addToQueue} disabled={isLoading || selectedProducts.length === 0 || selectedTypes.length === 0}>
          <Play className="w-4 h-4 mr-2" />
          Add to Queue
        </Button>
      </Card>

      {/* Active Queue */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Queue</h3>
          {queue.length > 0 && (
            <Button onClick={cancelAllJobs} variant="outline" size="sm">
              <Pause className="w-4 h-4 mr-2" />
              Cancel All
            </Button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No jobs in queue</p>
        ) : (
          <div className="space-y-3">
            {queue.map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {job.productId} - {job.type.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(job.createdAt).toLocaleString()}
                      {job.startedAt && ` • Started: ${new Date(job.startedAt).toLocaleString()}`}
                    </div>
                    {job.error && (
                      <div className="text-xs text-red-500 mt-1">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.status === 'queued' && (
                    <Button onClick={() => cancelJob(job.id)} size="sm" variant="outline">
                      <XCircle className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Job History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job History</h3>
          <Button onClick={clearHistory} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Old
          </Button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No job history</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice(0, 20).map(job => (
              <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {job.productId} - {job.type.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Duration: {formatDuration(job.startedAt, job.completedAt)}
                      {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleString()}`}
                    </div>
                    {job.error && (
                      <div className="text-xs text-red-500 mt-1">
                        Error: {job.error}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  {job.status === 'failed' && (
                    <Button onClick={() => retryJob(job.id)} size="sm" variant="outline">
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
} 