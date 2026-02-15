import React from 'react';
import { ResourceResponse } from '../../types/resource';
import { openProtectedFileInNewTab } from '../../api/resources';

type Props = {
  resource: ResourceResponse,
  onSubmitClick: (resource: ResourceResponse) => void
};

export default function ResourceCard({resource, onSubmitClick}: Props){
  return (
    <div className="card">
      <div className="card-head">
        <h3>{resource.title}</h3>
        <span className="badge">{resource.type}</span>
      </div>
      <p className="muted">Uploaded: {new Date(resource.createdAt).toLocaleDateString()}</p>

      <div className="actions">
        {resource.type === 'LINK' && resource.link && (
          <button onClick={() => window.open(resource.link, '_blank')}>Open Link</button>
        )}

        {resource.hasFile && (
          <button onClick={() => openProtectedFileInNewTab(/* you need fileId here */)}>Open File</button>
        )}

        {resource.type === 'HOMEWORK' && (
          <button onClick={() => onSubmitClick(resource)}>Submit Homework</button>
        )}
      </div>
    </div>
  );
}
