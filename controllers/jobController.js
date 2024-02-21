//import { nanoid } from "nanoid";

import mongoose from "mongoose";
import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";
import day from "dayjs";

//let jobs = [
//{ id: nanoid(), company: "apple", position: "front-end" },
//{ id: nanoid(), company: "google", position: "back-end" },
//];

export const getAllJobs = async (req, res) => {
  //console.log(req.query);

  const { search, jobStatus, jobType, sort } = req.query;
  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ];
  }

  if (jobStatus && jobStatus !== "all") {
    queryObject.jobStatus = jobStatus;
  }

  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "position",
    "z-a": "-position",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // set up page number/pagination

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

export const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  //const { company, position } = req.body;

  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

export const getJob = async (req, res) => {
  //const { id } = req.params;
  //const job = jobs.find((job) => job.id === id);
  const job = await Job.findById(req.params.id);

  //throw new Error("no job with that id");

  //return res.status(404).json({ msg: `no job with id ${id}` });

  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  //const { company, position } = req.body;
  //if (!company || !position) {
  //return res.status(400).json({ msg: "please provide company and position" });
  //}
  //const { id } = req.params;
  //const job = jobs.find((job) => job.id === id);
  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  //return res.status(404).json({ msg: `no job with id ${id}` });

  //job.company = company;
  //job.position = position;
  res.status(200).json({ msg: "job modified", job: updatedJob });
};

export const deleteJob = async (req, res) => {
  //const { id } = req.params;
  //const job = jobs.find((job) => job.id === id);
  const removedJob = await Job.findByIdAndDelete(req.params.id);

  //return res.status(404).json({ msg: `no job with id ${id}` });

  //const newJobs = jobs.filter((job) => job.id !== id);
  //jobs = newJobs;

  res.status(200).json({ msg: "job deleted", job: removedJob });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
  ]);
  //console.log(stats);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  //console.log(stats);

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format("MMM YY");
      return { date, count };
    })
    .reverse();
  //let monthlyApplications = [
  // {
  //   date: "May 23",
  //   count: 12,
  // },
  // {
  //   date: "June 23",
  //   count: 19,
  // },
  // {
  ////   date: "July 23",
  //   count: 3,
  // },
  // ];
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
