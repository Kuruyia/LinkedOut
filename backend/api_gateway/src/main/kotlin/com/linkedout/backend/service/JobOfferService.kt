package com.linkedout.backend.service

import com.linkedout.backend.model.Company
import com.linkedout.backend.model.Job
import com.linkedout.backend.model.JobOffer
import com.linkedout.common.service.NatsService
import com.linkedout.common.utils.RequestResponseFactory
import com.linkedout.proto.models.JobOfferOuterClass
import com.linkedout.proto.services.Jobs
import com.linkedout.proto.services.Jobs.ApplyToJobOfferRequest
import com.linkedout.proto.services.Recommendations
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class JobOfferService(
    private val natsService: NatsService,
    @Value("\${app.services.jobOffers.subjects.findAllForUser}") private val findAllSubject: String,
    @Value("\${app.services.jobOffers.subjects.findAllAppliedForUser}") private val findAllAppliedSubject: String,
    @Value("\${app.services.jobOffers.subjects.findOneForUser}") private val findOneSubject: String,
    @Value("\${app.services.jobOffers.subjects.findMultiple}") private val findMultipleSubject: String,
    @Value("\${app.services.jobOffers.subjects.applyTo}") private val applyToSubject: String,
    @Value("\${app.services.recommendation.subjects.findAll}") private val findAll: String

) {
    fun findAll(requestId: String, userId: String): List<JobOffer> {
        // Request job offers from the recommendation
        val request = RequestResponseFactory.newRequest(requestId)
            .setGetRecommendationRequest(
                Recommendations.GetRecommendationRequest.newBuilder()
                    .setUserId(userId)
            )
            .build()

        val response = natsService.requestWithReply(findAll, request)

        // Handle the response
        if (!response.hasGetRecommendationResponse()) {
            throw Exception("Invalid response")
        }

        val recommendationIds = response.getRecommendationResponse.recommendationsList.map { recommendation ->
            recommendation.id // Assuming Recommendation has an 'id' field representing its ID
        }

        if (recommendationIds.isEmpty()) {
            val requestJobOffers = RequestResponseFactory.newRequest(requestId)
                .setGetUserJobOffersRequest(
                    Jobs.GetUserJobOffersRequest.newBuilder()
                        .setUserId(userId)
                ).build()

            val responseJobOffers = natsService.requestWithReply(findAllSubject, requestJobOffers)

            // Handle the response
            if (!responseJobOffers.hasGetUserJobOffersResponse()) {
                throw Exception("Invalid response")
            }

            val getUserJobOffersResponse = responseJobOffers.getUserJobOffersResponse
            return getUserJobOffersResponse.jobOffersList.map { jobOffer ->
                convertJobOfferFromProto(jobOffer)
            }
        } else {
            val requestJobOffers = RequestResponseFactory.newRequest(requestId)
                .setGetMultipleJobOffersRequest(
                    Jobs.GetMultipleJobOffersRequest.newBuilder()
                        .addAllIds(recommendationIds)
                ).build()

            val responseJobOffers = natsService.requestWithReply(findMultipleSubject, requestJobOffers)

            // Handle the response
            if (!responseJobOffers.hasGetMultipleJobOffersResponse()) {
                throw Exception("Invalid response")
            }

            val getUserJobOffersResponse = responseJobOffers.getMultipleJobOffersResponse
            return getUserJobOffersResponse.jobOffersList.map { jobOffer ->
                convertJobOfferFromProto(jobOffer)
            }
        }
    }

    fun findAllApplied(requestId: String, userId: String): List<JobOffer> {
        // Request job offers from the job service
        val requestJobOffers = RequestResponseFactory.newRequest(requestId)
            .setGetUserJobOffersAppliedRequest(
                Jobs.GetUserJobOffersAppliedRequest.newBuilder()
                    .setUserId(userId)
            ).build()

        val responseJobOffers = natsService.requestWithReply(findAllAppliedSubject, requestJobOffers)

        // Handle the response
        if (!responseJobOffers.hasGetUserJobOffersAppliedResponse()) {
            throw Exception("Invalid response")
        }

        val getUserJobOffersAppliedResponse = responseJobOffers.getUserJobOffersAppliedResponse
        return getUserJobOffersAppliedResponse.jobOffersList.map { jobOffer ->
            convertJobOfferFromProto(jobOffer)
        }
    }

    fun findOne(requestId: String, userId: String, jobOfferId: String): JobOffer {
        // Request the job offer from the job offer service
        val request = RequestResponseFactory.newRequest(requestId)
            .setGetUserJobOfferRequest(
                Jobs.GetUserJobOfferRequest.newBuilder()
                    .setUserId(userId)
                    .setJobOfferId(jobOfferId)
            )
            .build()

        val response = natsService.requestWithReply(findOneSubject, request)

        // Handle the response
        if (!response.hasGetUserJobOfferResponse()) {
            throw Exception("Invalid response")
        }

        val getUserJobOfferResponse = response.getUserJobOfferResponse
        return convertJobOfferFromProto(getUserJobOfferResponse.jobOffer)
    }

    fun applyToJobOffer(requestId: String, userId: String, jobOfferId: String) {
        // Apply to the job offer using the job offer service
        val request = RequestResponseFactory.newRequest(requestId)
            .setApplyToJobOfferRequest(
                ApplyToJobOfferRequest.newBuilder()
                    .setUserId(userId)
                    .setJobOfferId(jobOfferId)
            )
            .build()

        val response = natsService.requestWithReply(applyToSubject, request)

        // Handle the response
        if (!response.hasApplyToJobOfferResponse()) {
            throw Exception("Invalid response")
        }
    }

    private fun convertJobOfferFromProto(source: JobOfferOuterClass.JobOffer): JobOffer {
        return JobOffer(
            source.id,
            source.title,
            source.description,
            LocalDate.parse(source.startDate),
            LocalDate.parse(source.endDate),
            source.geographicArea,
            Job(
                source.job.id,
                source.job.title,
                source.job.category
            ),
            Company(
                source.company.id,
                source.company.name
            ),
            source.salary,
            source.statusValue,
            source.employerId
        )
    }
}
