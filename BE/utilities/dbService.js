import collections from "../collections";
import { paginationFn } from "./pagination";

const createOneRecord = async (modelName, data) => {
  return await collections[modelName](data).save();
};

const createManyRecords = async (modelName, data, options = {}) => {
  return await collections[modelName].insertMany(data, options);
};

const updateManyRecords = async (modelName, query, data, options = {}) => {
  return await collections[modelName].updateMany(query, data, options);
};

const findOneRecord = async (
  modelName,
  query,
  options = {},
  isCollation = false
) => {
  if (isCollation)
    return await collections[modelName]
      .findOne(query, options)
      .collation({ locale: "en", strength: 2 });
  return await collections[modelName].findOne(query, options);
};

const findAllRecords = async (
  modelName,
  query,
  options = {},
  sort = { _id: -1 }
) => {
  return await collections[modelName].find(query, options).sort(sort);
};

const findDistinctKey = async (modelName, key, query) => {
  return await collections[modelName].distinct(key, query);
};

const recordsCount = async (modelName, query, options = {}) => {
  if (typeof collections[modelName]?.countDocuments === 'function') {
    return await collections[modelName].countDocuments(query);
  }
  return await collections[modelName].count(query);
};

const findOneAndUpdateRecord = async (
  modelName,
  query,
  payload,
  options = {}
) => {
  return await collections[modelName].findOneAndUpdate(query, payload, options);
};

const updateOneRecord = async (modelName, query, payload, options = {}) => {
  return await collections[modelName].updateOne(query, payload, options);
};

const aggregateData = async (modelName, query, isCollation = false) => {
  if (isCollation)
    return await collections[modelName]
      .aggregate(query)
      .collation({ locale: "en" });
  return await collections[modelName].aggregate(query);
};

const findManyRecordsWithPagination = async (
  modelName,
  query,
  { sort, page = 1, limit },
  options = {}
) => {
  const { docLimit, noOfDocSkip } = paginationFn({
    page,
    limit,
  });

  return {
    items: await collections[modelName]
      .find(query, options)
      .sort(sort)
      .skip(noOfDocSkip)
      .limit(docLimit),
    count: await collections[modelName].count(query),
    page,
    limit: docLimit,
  };
};

const updateBulkRecords = async (modelName, payload) => {
  return new Promise(async function (resolve, reject) {
    collections[modelName]
      .bulkWrite(payload)
      .then((response) => {
        resolve(true);
      })
      .catch((error) => {
        console.error(error);
        resolve(false);
      });
  });
};

const findAllRecordsWithPopulate = async (
  modelName,
  query,
  options = {},
  populateOptions = {}
) => {
  return await collections[modelName]
    .find(query, options)
    .populate(populateOptions);
};
const findLastRecord = async (modelName, query) => {
  return await collections[modelName].find(query).sort({ _id: -1 }).limit(1);
};

const findManyRecordsWithPaginationAndPopulate = async (
  modelName,
  query,
  { sort, page = 1, limit },
  options = {},
  populateOptions = {}
) => {
  const { docLimit, noOfDocSkip } = paginationFn({
    page,
    limit,
  });

  return {
    items: await collections[modelName]
      .find(query, options)
      .sort(sort)
      .skip(noOfDocSkip)
      .limit(docLimit)
      .populate(populateOptions),
    count: await collections[modelName].count(query),
    page,
    limit: docLimit,
  };
};

const findOneRecordsWithPopulate = async (
  modelName,
  query,
  options = {},
  populateOptions = {}
) => {
  return await collections[modelName]
    .findOne(query, options)
    .populate(populateOptions);
};

const findAllRecordsWithPopulateSort = async (
  modelName,
  query,
  { sort },
  options = {},
  populateOptions = {}
) => {
  return await collections[modelName]
    .find(query, options)
    .sort(sort)
    .populate(populateOptions);
};
const findOneAndDeleteRecord = async (modelName, query, options = {}) => {
  return await collections[modelName].findOneAndDelete(query, options);
};

const deleteOneRecord = async (modelName, query, options = {}) => {
  return await collections[modelName].deleteOne(query, options);
};

const dbService = {
  findOneRecord,
  findAllRecords,
  aggregateData,
  findOneAndUpdateRecord,
  updateOneRecord,
  recordsCount,
  updateManyRecords,
  createManyRecords,
  createOneRecord,
  findManyRecordsWithPagination,
  findDistinctKey,
  updateBulkRecords,
  findLastRecord,
  findAllRecordsWithPopulate,
  findManyRecordsWithPaginationAndPopulate,
  findOneRecordsWithPopulate,
  findAllRecordsWithPopulateSort,
  findOneAndDeleteRecord,
  deleteOneRecord
};

export default dbService;
export {
  findOneRecord,
  findAllRecords,
  aggregateData,
  findOneAndUpdateRecord,
  updateOneRecord,
  recordsCount,
  updateManyRecords,
  createManyRecords,
  createOneRecord,
  findManyRecordsWithPagination,
  findDistinctKey,
  updateBulkRecords,
  findLastRecord,
  findAllRecordsWithPopulate,
  findManyRecordsWithPaginationAndPopulate,
  findOneRecordsWithPopulate,
  findAllRecordsWithPopulateSort,
  findOneAndDeleteRecord,
  deleteOneRecord
};

