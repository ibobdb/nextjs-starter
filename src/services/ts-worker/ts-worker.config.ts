import dotenv from 'dotenv';
dotenv.config();
export default function tsWorkerConfig() {
    return {
        worker_key : process.env.TS_WORKER_KEY,
        worker_secret : process.env.TS_WORKER_SECRET,
        worker_url : process.env.TS_WORKER_URL,
        worker_port : process.env.TS_WORKER_PORT,
        worker_timeout : process.env.TS_WORKER_TIMEOUT,
        worker_max_retries : process.env.TS_WORKER_MAX_RETRIES,
        worker_concurrency : process.env.TS_WORKER_CONCURRENCY,
        worker_log_level : process.env.TS_WORKER_LOG_LEVEL,
        worker_log_file : process.env.TS_WORKER_LOG_FILE,
        worker_log_file_name : process.env.TS_WORKER_LOG_FILE_NAME,
        worker_log_file_path : process.env.TS_WORKER_LOG_FILE_PATH,
        worker_log_file_max_size : process.env.TS_WORKER_LOG_FILE_MAX_SIZE,
        worker_log_file_max_files : process.env.TS_WORKER_LOG_FILE_MAX_FILES,
        worker_log_file_max_days : process.env.TS_WORKER_LOG_FILE_MAX_DAYS, 
        worker_log_file_max_backups : process.env.TS_WORKER_LOG_FILE_MAX_BACKUPS,
        
    }   
}