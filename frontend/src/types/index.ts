// Type definitions for the application

// User role enum
export enum UserRole {
    UNDEFINED = 'UNDEFINED',
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN'
}

// KYC application status enum
export enum KycApplicationStatus {
    UNDEFINED = 'UNDEFINED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING'
}

// Poll status enum
export enum PollStatus {
    UNDEFINED = 'UNDEFINED',
    REVIEW = 'REVIEW',
    DECLINED = 'DECLINED',
    APPROVED_AND_WAITING = 'APPROVED_AND_WAITING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

// User interface
export interface User {
    studentIdNumber: string;
    firstName: string;
    lastName: string;
    kycStatus: KycApplicationStatus;
    role: UserRole;
    createdAt: number;
    updatedAt: number;
}

// KYC Application interface
export interface KycApplication {
    id: string;
    userId: string;
    status: KycApplicationStatus;
    createdAt: number;
    updatedAt: number;
}

// Poll interface
export interface Poll {
    id: string;
    title: string;
    description: string;
    authorStudentIdNumber: string;
    optionIds: string[];
    participantIds: string[];
    plannedStartDate: number | null;
    plannedEndDate: number | null;
    status: PollStatus;
    createdAt: number;
    updatedAt: number;
}

// Poll Option interface
export interface PollOption {
    id: string;
    pollId: string;
    text: string;
    voteCount: number;
    createdAt: number;
    updatedAt: number;
}

// Auth token payload
export interface TokenPayload {
    studentIdNumber: string;
}

// API response interface
export interface ApiResponse<T> {
    status: string;
    submitted: boolean;
    result: T;
}
