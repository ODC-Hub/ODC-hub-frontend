export type ResourceType = 'PDF' | 'LINK' | 'ATELIER' | 'HOMEWORK';

export interface ResourceCreateRequest {
  title: string;
  moduleId: string;
  description: string;
  type: ResourceType;
  link?: string;
  assignedTo?: string[];
}

export interface ResourceResponse {
  id: string;
  title: string;
  moduleId: string;
  description: string;
  type: ResourceType;
  hasFile: boolean;
  link?: string;
  validated: boolean;
  createdAt: string; // ISO Date string
  gridFsFileId?: string;
  filename?: string;
  assignedTo?: string[];
  totalSubmissions?: number;
  pendingSubmissions?: number;
}

export interface LivrableCreateRequest {
  resourceId: string;
  comment?: string;
}

export type LivrableStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';

export interface LivrableResponse {
  id: string;
  resourceId: string;
  bootcamperId: string;
  fileId?: string;
  filename?: string;
  status: LivrableStatus;
  comment?: string;
  submittedAt: string; // ISO Date string
  reviewedAt?: string; // ISO Date string
  reviewedBy?: string;
  reviewerComment?: string;
  studentComment?: string;
  bootcamperName?: string;
}
