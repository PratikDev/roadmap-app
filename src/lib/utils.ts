import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param inputs Class values to be merged
 * @description A utility function to merge class names using clsx and twMerge.
 * @returns Merged class names as a string.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * @param name Name of the environment variable
 * @description This function retrieves the value of an environment variable by its name and throws an error if the variable is not found.
 * @returns Value of the environment variable
 * @throws Throws "Missing environment variable ${name}" if the variable is not found
 */
export function getEnv(name: keyof EnvVariablesType) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing environment variable ${name}`);
	}
	return value;
}
