import { VotingSystemContract } from './votingSystem.contract';

import { type Contract } from 'fabric-contract-api';

export const contracts: typeof Contract[] = [VotingSystemContract];
