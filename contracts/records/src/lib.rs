#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, IntoVal, String, Symbol, Vec, symbol_short,
};

// Storage keys
const RECORD_COUNTER: Symbol = symbol_short!("REC_CNT");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Record {
    pub record_id: u64,
    pub cid: String,
    pub owner: Address,
    pub timestamp: u64,
    pub title: String,
    pub category: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RecordWithStatus {
    pub record_id: u64,
    pub cid: String,
    pub owner: Address,
    pub timestamp: u64,
    pub title: String,
    pub category: String,
    pub status: Symbol,
    pub doctor: Option<Address>,
    pub verified_at: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Verification {
    pub record_id: u64,
    pub status: Symbol,
    pub doctor: Address,
    pub timestamp: u64,
    pub reason: Option<String>,
}

fn get_record_key(env: &Env, record_id: u64) -> (Symbol, u64) {
    (Symbol::new(env, "RECORD"), record_id)
}

fn get_owner_key(env: &Env, owner: &Address) -> (Symbol, Address) {
    (Symbol::new(env, "OWNER_RECORDS"), owner.clone())
}

#[contract]
pub struct RecordsContract;

#[contractimpl]
impl RecordsContract {
    /// Store a new medical record
    /// Returns the assigned record_id
    pub fn store_record(
        env: Env,
        owner: Address,
        cid: String,
        title: String,
        category: String,
    ) -> u64 {
        // Require authorization from owner
        owner.require_auth();

        // Get and increment counter
        let mut counter: u64 = env.storage().instance().get(&RECORD_COUNTER).unwrap_or(0);
        counter += 1;

        // Create record
        let record = Record {
            record_id: counter,
            cid: cid.clone(),
            owner: owner.clone(),
            timestamp: env.ledger().timestamp(),
            title: title.clone(),
            category: category.clone(),
        };

        // Store record
        let record_key = get_record_key(&env, counter);
        env.storage().persistent().set(&record_key, &record);

        // Update owner's record list
        let owner_key = get_owner_key(&env, &owner);
        let mut owner_records: Vec<u64> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or(Vec::new(&env));
        owner_records.push_back(counter);
        env.storage().persistent().set(&owner_key, &owner_records);

        // Update counter
        env.storage().instance().set(&RECORD_COUNTER, &counter);

        counter
    }

    /// Get a single record by ID
    pub fn get_record(env: Env, record_id: u64) -> Record {
        let record_key = get_record_key(&env, record_id);
        env.storage()
            .persistent()
            .get(&record_key)
            .unwrap_or_else(|| panic!("Record not found"))
    }

    /// Get all records for a specific owner
    pub fn get_records_by_owner(env: Env, owner: Address) -> Vec<Record> {
        let owner_key = get_owner_key(&env, &owner);
        let record_ids: Vec<u64> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or(Vec::new(&env));

        let mut records = Vec::new(&env);
        for id in record_ids.iter() {
            let record_key = get_record_key(&env, id);
            if let Some(record) = env.storage().persistent().get::<(Symbol, u64), Record>(&record_key) {
                records.push_back(record);
            }
        }

        records
    }

    /// Get the current record count
    pub fn get_record_count(env: Env) -> u64 {
        env.storage().instance().get(&RECORD_COUNTER).unwrap_or(0)
    }

    /// Get record with verification status (cross-contract call)
    pub fn get_record_with_status(
        env: Env,
        record_id: u64,
        verification_contract_id: Address,
    ) -> RecordWithStatus {
        // Get the record
        let record = Self::get_record(env.clone(), record_id);

        // Cross-invoke verification contract
        let verification: Option<Verification> = env.invoke_contract(
            &verification_contract_id,
            &Symbol::new(&env, "get_verification"),
            (record_id,).into_val(&env),
        );

        // Build response with status
        match verification {
            Some(v) => RecordWithStatus {
                record_id: record.record_id,
                cid: record.cid,
                owner: record.owner,
                timestamp: record.timestamp,
                title: record.title,
                category: record.category,
                status: v.status,
                doctor: Some(v.doctor),
                verified_at: Some(v.timestamp),
            },
            None => RecordWithStatus {
                record_id: record.record_id,
                cid: record.cid,
                owner: record.owner,
                timestamp: record.timestamp,
                title: record.title,
                category: record.category,
                status: symbol_short!("pending"),
                doctor: None,
                verified_at: None,
            },
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_store_and_retrieve_record() {
        let env = Env::default();
        let contract_id = env.register_contract(None, RecordsContract);
        let client = RecordsContractClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let cid = String::from_str(&env, "QmTest123");
        let title = String::from_str(&env, "Blood Test");
        let category = String::from_str(&env, "Haematology");

        // Store record
        let record_id = client.store_record(&owner, &cid, &title, &category);
        assert_eq!(record_id, 1);

        // Retrieve record
        let record = client.get_record(&record_id);
        assert_eq!(record.cid, cid);
        assert_eq!(record.owner, owner);
        assert_eq!(record.title, title);
    }
}
