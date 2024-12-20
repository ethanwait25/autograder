import { useEffect, useState } from 'react';
import { Button, Table } from 'react-bootstrap';
import { AdminPresenter, AdminView } from '../../presenter/AdminPresenter';
import { User } from '../../model/domain/User';
import { ConfirmPopoverButton } from './ConfirmPopoverButton';

export function Admin() {
  const [submissionsEnabled, setSubmissionsEnabled] = useState<boolean>(
    localStorage.getItem('submissionsEnabled') ? localStorage.getItem('submissionsEnabled') === 'true' : false
  );
  const [admins, setAdmins] = useState<User[]>([]);
  const listener: AdminView = {
    setSubmissionsEnabled,
    setAdmins,
  };
  const [presenter] = useState(new AdminPresenter(listener));
  useEffect(() => {
    presenter.getSubmissionsEnabled();
  }, []);
  return (
    <>
      <h1>Admin</h1>
      <div>
        <Button variant={submissionsEnabled ? 'danger' : 'success'} onClick={() => presenter.toggleSubmissionsEnabled()}>
          {submissionsEnabled ? 'Disable Submissions' : 'Enable Submissions'}
        </Button>
      </div>
      <Button variant={admins.length ? 'secondary' : 'primary'} onClick={() => presenter.toggleAdminList(admins)}>
        {admins.length ? 'Hide List' : 'List Admins'}
      </Button>
      {admins.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>NetId</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.netId}>
                <td>{admin.netId}</td>
                <td>{admin.name}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => console.log('Deleting Admin', admin.netId)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <ConfirmPopoverButton label="Remove Student Data" onConfirm={() => console.log('Deleting Student Data')} />
    </>
  );
}
