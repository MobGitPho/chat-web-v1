export class UserSessionModel {
  id?: number
  ipAddress: string
  userAgent: string
  lastActivity: string
  createdAt?: string
  updatedAt?: string

  constructor(
    ipAddress: string,
    userAgent: string,
    lastActivity: string,
    id?: number,
    createdAt?: string,
    updatedAt?: string
  ) {
    this.id = id
    this.ipAddress = ipAddress
    this.userAgent = userAgent
    this.lastActivity = lastActivity
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
