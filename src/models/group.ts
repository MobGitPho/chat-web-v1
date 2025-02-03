
export class GroupModel {
    id?: number
    name?: string | null
    code?: string | null

    deletedAt?: string | null
    createdAt?: string
    updatedAt?: string

    constructor(
        id?: number,
        name?: string | null,
        code?: string | null,

        deletedAt?: string | null,
        createdAt?: string,
        updatedAt?: string
    ) {
        this.id = id
        this.name = name
        this.code = code

        this.deletedAt = deletedAt
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }
}