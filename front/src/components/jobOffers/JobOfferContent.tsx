import { useLocales } from 'expo-localization';
import { FC, useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { JobOfferMessageSender } from '@/components/jobOffers/JobOfferMessageSender';
import JobOfferStatusBadge from '@/components/jobOffers/JobOfferStatusBadge';
import { JobOffer, JobOfferStatus } from '@/models/entities/jobOffer';
import { Message } from '@/models/entities/message';
import { usePostApplyJobOfferMutation } from '@/store/api/jobOfferApiSlice';
import i18n from '@/utils/i18n';

/**
 * The styles for the JobOfferContent component.
 */
const styles = StyleSheet.create({
  button: {
    width: 200,
  },
  container: {
    gap: 16,
  },
  horizontalContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  offerTitle: {
    flex: 1,
  },
  sectionContainer: {
    gap: 8,
  },
  verticalCentered: {
    alignItems: 'center',
    flexDirection: 'column',
  },
});

/**
 * The props for the JobOfferContent component.
 */
type JobOfferContentProps = {
  /**
   * The job offer to display.
   */
  jobOffer: JobOffer;

  /**
   * The function to call when a message has been sent.
   */
  onMessageSent?: (message: Message) => void;

  /**
   * The function to call when the user wants to see the employer's info.
   */
  onEmployerInfoClick?: () => void;
};

/**
 * Displays the details about a job offer.
 * @constructor
 */
const JobOfferContent: FC<JobOfferContentProps> = ({
  jobOffer,
  onMessageSent,
  onEmployerInfoClick,
}) => {
  // API calls
  const [applyToJobOffer] = usePostApplyJobOfferMutation();

  // Hooks
  const locales = useLocales();
  const theme = useTheme();

  // Callbacks
  const handleApplyToJobOffer = useCallback(
    (jobOffer: JobOffer) => {
      Alert.alert(
        i18n.t('jobOffer.apply.applyTitle'),
        i18n.t('jobOffer.apply.applyConfirm'),
        [
          {
            text: i18n.t('common.cancel'),
            style: 'cancel',
          },
          {
            text: i18n.t('common.confirm'),
            onPress: () => applyToJobOffer(jobOffer.id),
          },
        ],
      );
    },
    [applyToJobOffer],
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionContainer}>
        <View style={styles.horizontalContainer}>
          <Text
            variant='titleLarge'
            style={styles.offerTitle}
          >{`${jobOffer.title}`}</Text>

          <JobOfferStatusBadge status={jobOffer.status} />
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.horizontalContainer}>
            <MaterialCommunityIcons
              name='calendar'
              size={24}
              style={{ color: theme.colors.onSurface }}
            />
            <Text variant='labelLarge'>
              {`${new Date(jobOffer.startDate).toLocaleDateString(
                locales[0].languageTag,
              )} - ${new Date(jobOffer.endDate).toLocaleDateString(
                locales[0].languageTag,
              )}`}
            </Text>
          </View>

          <View style={styles.horizontalContainer}>
            <MaterialCommunityIcons
              name='map-marker'
              size={24}
              style={{ color: theme.colors.onSurface }}
            />
            <Text variant='labelLarge'>{`${jobOffer.geographicArea}`}</Text>
          </View>
        </View>
      </View>

      <Text>{`${jobOffer.description}`}</Text>

      {jobOffer.status === JobOfferStatus.NOT_APPLIED && (
        <View style={styles.verticalCentered}>
          <Button
            mode={'contained-tonal'}
            style={styles.button}
            onPress={() => handleApplyToJobOffer(jobOffer)}
          >
            {i18n.t('jobOffer.apply.apply')}
          </Button>
        </View>
      )}

      {jobOffer.status === JobOfferStatus.ACCEPTED && (
        <>
          <JobOfferMessageSender
            employerId={jobOffer.employerId}
            onMessageSent={onMessageSent}
          />

          <Button mode={'contained-tonal'} onPress={onEmployerInfoClick}>
            {i18n.t('jobOffer.info.employerInfo')}
          </Button>
        </>
      )}
    </View>
  );
};

export default JobOfferContent;
