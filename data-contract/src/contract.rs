pub use init::CertificationContractInitOptions;
use near_contract_standards::non_fungible_token::{
    metadata::NFTContractMetadata, NonFungibleToken,
};
use near_sdk::{
    assert_one_yocto,
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::LazyOption,
    env,
    json_types::*,
    near_bindgen, require, AccountId, PanicOnDefault, Promise,
};

use crate::storage_key::StorageKey;

mod init;
mod invalidate;
mod mint;
mod nft;

#[near_bindgen]
#[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
pub struct CertificationContract {
    pub(crate) tokens: NonFungibleToken,
    pub(crate) metadata: LazyOption<NFTContractMetadata>,
    pub(crate) can_transfer: bool,
    pub(crate) can_invalidate: bool,
    pub(crate) trash_account: LazyOption<AccountId>,
}

#[near_bindgen]
impl CertificationContract {
    pub fn owner_id(&self) -> AccountId {
        self.tokens.owner_id.clone()
    }

    pub(crate) fn assert_owner(&self) {
        require!(
            env::predecessor_account_id() == self.tokens.owner_id,
            "Unauthorized"
        ); // TODO: Improve this error message to give a hint about how to call the function successfully (and update the existing hint in the readme).
    }

    pub(crate) fn assert_can_transfer(&self) {
        require!(self.can_transfer, "Certifications cannot be transferred");
    }

    pub(crate) fn assert_can_invalidate(&self) {
        require!(self.can_invalidate, "Certifications cannot be invalidated");
    }

    pub fn cert_can_transfer(&self) -> bool {
        self.can_transfer
    }

    pub fn cert_can_invalidate(&self) -> bool {
        self.can_invalidate
    }

    #[payable]
    pub fn set_metadata(&mut self, metadata: NFTContractMetadata) {
        // Force owner
        self.assert_owner();
        // Force verification
        assert_one_yocto();

        self.metadata.set(&metadata);
    }

    pub fn get_max_withdrawal(&self) -> U128 {
        U128::from(env::account_balance() - env::storage_byte_cost() * env::storage_usage() as u128)
    }

    #[payable]
    pub fn withdraw(&mut self, amount: U128) -> Promise {
        // Force owner
        self.assert_owner();
        // Force verification
        assert_one_yocto();

        let amount = amount.into();
        let max = self.get_max_withdrawal().into();

        require!(amount <= max, "Insufficient balance");

        Promise::new(self.owner_id()).transfer(amount)
    }

    #[payable]
    pub fn withdraw_max(&mut self) -> Promise {
        self.withdraw(self.get_max_withdrawal())
    }

    pub fn get_trash_account(&self) -> Option<AccountId> {
        self.trash_account.get()
    }

    #[payable]
    pub fn set_trash_account(&mut self, trash_account: Option<AccountId>) {
        // Force owner
        self.assert_owner();
        // Force verification
        assert_one_yocto();

        if let Some(trash_account) = trash_account {
            self.trash_account.set(&trash_account);
        } else {
            self.trash_account.remove();
        }
    }

    #[private]
    #[init(ignore_state)]
    pub fn migrate(trash_account: Option<AccountId>) -> Self {
        #[derive(BorshDeserialize)]
        pub struct OldContract {
            pub tokens: NonFungibleToken,
            pub metadata: LazyOption<NFTContractMetadata>,
            pub can_transfer: bool,
            pub can_invalidate: bool,
        }

        let old: OldContract = env::state_read().unwrap();

        Self {
            tokens: old.tokens,
            metadata: old.metadata,
            can_transfer: old.can_transfer,
            can_invalidate: old.can_invalidate,
            trash_account: LazyOption::new(StorageKey::TrashAccount, trash_account.as_ref()),
        }
    }
}
