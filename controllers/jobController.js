//import { nanoid } from "nanoid";

import Job from "../models/JobModel.js";
import { StatusCodes } from "http-status-codes";

//let jobs = [
//{ id: nanoid(), company: "apple", position: "front-end" },
//{ id: nanoid(), company: "google", position: "back-end" },
//];

export const getAllJobs = async (req, res) => {
  console.log(req);
  const jobs = await Job.find({});
  res.status(StatusCodes.OK).json({ jobs });
};

export const createJob = async (req, res) => {
  const { company, position } = req.body;

  const job = await Job.create({ company, position });
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
