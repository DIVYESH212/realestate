const defaultLimit = process.env.LIMIT || 10;

export const paginationFn = ({ sort = null, page = 1, limit = defaultLimit, holdingSort }, defaultSortOn = 'createdAt') => {
    const skip = (page - 1) * limit;
    limit=parseInt(limit)

    const sortBy = holdingSort ? { _id: 1 } : { _id: -1 }

    return {
        sortBy,
        docLimit: limit,
        noOfDocSkip: skip
    }
};