import { DetailsViewSectionProps, registerDetailsViewSection } from '@kinvolk/headlamp-plugin/lib';
import Alert from '@material-ui/lab/Alert';
import React, { useEffect, useState } from 'react';
import { GenericMetricsChart } from './common';
import { isPrometheusInstalled } from './request';

function MetricsEnabled({ children }) {
  const [prometheusInstalled, setPrometheusInstalled] = useState<boolean>(false);
  const [promPodName, setPromPodName] = useState<string>(null);
  const [promNamespace, setPromNamespace] = useState<string>(null);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setState('loading');
      const [isInstalled, podName, namespace] = await isPrometheusInstalled();
      setPromPodName(podName);
      setPromNamespace(namespace);
      setPrometheusInstalled(isInstalled);
      setState(null);
    })();
  }, []);

  return (
    <div>
      {prometheusInstalled ? (
        <>
          {React.cloneElement(children, {
            prometheusPrefix: `${promNamespace}/pods/${promPodName}`,
          })}
        </>
      ) : state === 'loading' ? (
        <Alert severity="info">Fetching Prometheus Info</Alert>
      ) : (
        <Alert severity="info">Prometheus is not installed</Alert>
      )}
    </div>
  );
}

function PrometheusMetrics(resource: DetailsViewSectionProps) {
  console.log(resource, resource.kind);
  if (resource.kind === 'Pod' || resource.kind === 'Job' || resource.kind === 'CronJob') {
    return (
      <MetricsEnabled>
        <GenericMetricsChart
          cpuQuery={`sum(rate(container_cpu_usage_seconds_total{container!='',namespace='${resource.jsonData.metadata.namespace}',pod='${resource.jsonData.metadata.name}'}[1m])) by (pod,namespace)`}
          memoryQuery={`sum(container_memory_working_set_bytes{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}'}) by (pod,namespace)`}
          networkRxQuery={`sum(rate(container_network_receive_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod='${resource.jsonData.metadata.name}'}[1m])) by (pod,namespace)`}
          networkTxQuery={`sum(rate(container_network_transmit_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod='${resource.jsonData.metadata.name}'}[1m])) by (pod,namespace)`}
          filesystemReadQuery={`sum(rate(container_fs_reads_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod='${resource.jsonData.metadata.name}'}[1m])) by (pod,namespace)`}
          filesystemWriteQuery={`sum(rate(container_fs_writes_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod='${resource.jsonData.metadata.name}'}[1m])) by (pod,namespace)`}
        />
      </MetricsEnabled>
    );
  }
  if (resource.kind === 'Deployment' || resource.kind === 'StatefulSet' || resource.kind === 'DaemonSet' || resource.kind === 'ReplicaSet') {
    return (
      <MetricsEnabled>
        <GenericMetricsChart
          cpuQuery={`sum(rate(container_cpu_usage_seconds_total{container!='',namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
          memoryQuery={`sum(container_memory_working_set_bytes{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}) by (pod,namespace)`}
          networkRxQuery={`sum(rate(container_network_receive_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
          networkTxQuery={`sum(rate(container_network_transmit_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
          filesystemReadQuery={`sum(rate(container_fs_reads_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
          filesystemWriteQuery={`sum(rate(container_fs_writes_bytes_total{namespace='${resource.jsonData.metadata.namespace}',pod=~'${resource.jsonData.metadata.name}-.*'}[1m])) by (pod,namespace)`}
        />
      </MetricsEnabled>
    );
  }

  //   if (resource.kind === 'Node') {
  //     return (
  //         <MetricsEnabled>
  //             <NodeMetrics
  //                 nodeName={resource.jsonData.status.addresses[0].address}
  //             />
  //         </MetricsEnabled>
  //     )}
  return <div>not a pod</div>;
}

registerDetailsViewSection(({ resource }: DetailsViewSectionProps) => {
  return PrometheusMetrics(resource);
});
