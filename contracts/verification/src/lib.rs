#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Verification {
    pub record_id: u64,
    pub status: Symbol,
    pub doctor: Address,
    pub timestamp: u64,
    pub reason: Option<String>,
}

fn get_verification_key(env: &Env, record_id: u64) -> (Symbol, u64) {
    (Symbol::new(env, "VERIFICATION"), record_id)
}

#[contract]
pub struct VerificationContract;

#[contractimpl]
impl VerificationContract {
    /// Submit a verification decision for a record
    pub fn verify_record(
        env: Env,
        doctor: Address,
        record_id: u64,
        status: Symbol,
        reason: Option<String>,
    ) -> bool {
        // Require authorization from doctor
        doctor.require_auth();

        // Validate status
        let verified = symbol_short!("verified");
        let rejected = symbol_short!("rejected");

        if status != verified && status != rejected {
            panic!("Status must be 'verified' or 'rejected'");
        }

        // If rejected, reason must be provided
        if status == rejected {
            match &reason {
                None => panic!("Rejection reason is required"),
                Some(r) => {
                    if r.len() == 0 {
                        panic!("Rejection reason cannot be empty");
                    }
                }
            }
        }

        // Create verification
        let verification = Verification {
            record_id,
            status: status.clone(),
            doctor: doctor.clone(),
            timestamp: env.ledger().timestamp(),
            reason: reason.clone(),
        };

        // Store verification
        let key = get_verification_key(&env, record_id);
        env.storage().persistent().set(&key, &verification);

        true
    }

    /// Get verification for a record
    pub fn get_verification(env: Env, record_id: u64) -> Option<Verification> {
        let key = get_verification_key(&env, record_id);
        env.storage().persistent().get(&key)
    }

    /// Check if a record is verified
    pub fn is_verified(env: Env, record_id: u64) -> bool {
        let key = get_verification_key(&env, record_id);
        match env.storage().persistent().get::<(Symbol, u64), Verification>(&key) {
            Some(v) => v.status == symbol_short!("verified"),
            None => false,
        }
    }

    /// Get the verifier (doctor) address for a record
    pub fn get_verifier(env: Env, record_id: u64) -> Option<Address> {
        let key = get_verification_key(&env, record_id);
        env.storage()
            .persistent()
            .get::<(Symbol, u64), Verification>(&key)
            .map(|v| v.doctor)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_verify_record() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VerificationContract);
        let client = VerificationContractClient::new(&env, &contract_id);

        let doctor = Address::generate(&env);
        let record_id = 1u64;
        let status = symbol_short!("verified");

        // Verify record
        let result = client.verify_record(&doctor, &record_id, &status, &None);
        assert_eq!(result, true);

        // Check verification
        let is_verified = client.is_verified(&record_id);
        assert_eq!(is_verified, true);

        // Get verifier
        let verifier = client.get_verifier(&record_id);
        assert_eq!(verifier, Some(doctor));
    }

    #[test]
    #[should_panic(expected = "Rejection reason is required")]
    fn test_reject_without_reason() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VerificationContract);
        let client = VerificationContractClient::new(&env, &contract_id);

        let doctor = Address::generate(&env);
        let record_id = 1u64;
        let status = symbol_short!("rejected");

        // This should panic
        client.verify_record(&doctor, &record_id, &status, &None);
    }
}
