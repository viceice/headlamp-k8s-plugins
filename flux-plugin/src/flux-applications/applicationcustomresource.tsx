import {
  DateLabel,
  Link,
  SectionBox,
  ShowHideLabel,
  StatusLabel,
  Table,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { KubeObject } from '@kinvolk/headlamp-plugin/lib/lib/k8s/cluster';
import { KubeCRD } from '@kinvolk/headlamp-plugin/lib/lib/k8s/crd';
import { getSourceNameAndType } from '../helpers/index';

export default function FluxCustomResource(props: {
  resourceClass: KubeObject;
  title?: string;
  type: string;
}) {
  const { resourceClass, title, type } = props;
  const [resource] = resourceClass.useList();

  function prepareStatus(item: KubeCRD) {
    const ready = item.status?.conditions?.find(c => c.type === 'Ready');
    if (ready.status === 'Unknown') {
      return <StatusLabel status="warning">Reconciling</StatusLabel>;
    }
    return (
      <StatusLabel status={ready.status === 'True' ? 'success' : 'error'}>
        {ready.status === 'True' ? 'Ready' : 'Failed'}
      </StatusLabel>
    );
  }

  function prepareLastUpdated(item: KubeCRD) {
    const condition = item?.jsonData?.status?.conditions?.find(c => c.type === 'Ready');
    return condition?.lastTransitionTime;
  }

  return (
    <SectionBox title={title}>
      <Table
        data={resource}
        defaultSortingColumn={2}
        columns={[
          {
            header: 'Name',
            accessorKey: 'metadata.name',
            Cell: ({ row: { original: item } }) => {
              return (
                <Link
                  routeName={`/flux/${type}/:namespace/:type/:name`}
                  params={{
                    name: item.metadata.name,
                    namespace: item.metadata.namespace,
                    type: title.split(' ').join('').toLowerCase(),
                  }}
                >
                  {' '}
                  {item.metadata.name}{' '}
                </Link>
              );
            },
          },
          {
            header: 'Namespace',
            accessorKey: 'metadata.namespace',
            Cell: ({ row: { original: item } }) => (
              <Link
                routeName="namespace"
                params={{
                  name: item.metadata.namespace,
                }}
              >
                {item.metadata.namespace}
              </Link>
            ),
          },
          {
            header: 'Status',
            accessorFn: item => {
              return prepareStatus(item.jsonData);
            },
          },
          {
            header: 'Source',
            accessorFn: item => {
              const { name, type } = getSourceNameAndType(item);
              return (
                <Link
                  routeName={`/flux/sources/:namespace/:type/:name`}
                  params={{ namespace: item.jsonData.metadata.namespace, type, name }}
                >
                  {name}
                </Link>
              );
            },
          },
          {
            header: 'Revision',
            accessorFn: item => {
              const reference = item.jsonData.status?.lastAttemptedRevision;
              return reference || '-';
            },
          },
          {
            header: 'Message',
            accessorFn: item => {
              const message = item.jsonData.status?.conditions?.find(
                c => c.type === 'Ready'
              )?.message;
              return (
                <ShowHideLabel labelId={item?.metadata?.uid || ''}>{message || ''}</ShowHideLabel>
              );
            },
          },
          {
            header: 'Last Updated',
            accessorFn: item => <DateLabel date={prepareLastUpdated(item)} />,
          },
        ]}
      />
    </SectionBox>
  );
}
