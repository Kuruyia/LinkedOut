package com.linkedout.recommendation.service

import com.linkedout.recommendation.entity.JobOfferEntity
import com.linkedout.recommendation.repository.JobOfferRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux

@Service
class RecommendationService(
    private val jobOfferRepository: JobOfferRepository
) {
    fun getRecommendations(userId: String): Flux<JobOfferEntity> {
        return jobOfferRepository.getRecommendations(userId)
    }
}
